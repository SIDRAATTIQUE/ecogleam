import { NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function sanitizeInput(input: string = ""): string {
  return input
    .replace(/https?:\/\/[^\s]+/g, "")
    .replace(/[<>]/g, "")
    .trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cart, customer, payment } = body;

    // 1. Basic Cart Validation
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // 1b. Payment Method Validation
    const paymentMethod = payment?.method === "online" ? "online" : "cod";

    // 2. Validate Customer Info
    const customerName = sanitizeInput(customer?.name || "Valued Customer");
    const rawEmail = (customer?.email || "").trim().toLowerCase();
    const customerPhone = sanitizeInput(customer?.phone || "");
    const customerAddress = sanitizeInput(customer?.address || "No address provided");
    const customerCity = sanitizeInput(customer?.city || "");

    const phoneRegex = /^[0-9+\-\s()]{7,20}$/;
    if (!phoneRegex.test(customerPhone)) {
      return NextResponse.json(
        { error: "Please provide a valid phone number." },
        { status: 400 }
      );
    }

    if (rawEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(rawEmail)) {
        return NextResponse.json(
          { error: "Please provide a valid email address." },
          { status: 400 }
        );
      }
    }

    // 3. Totals Calculation (Rs. 200 Shipping, FREE at >= 2000, 0% Tax)
    const subtotal = cart.reduce(
      (sum: number, item: any) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );
    const shipping = subtotal >= 2000 ? 0 : 200;
    const grandTotal = subtotal + shipping; // No tax included

    // 4. Unique Order ID
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    const orderId = `ECO-${Date.now().toString().slice(-4)}${randomHex}`;

    // 5. Format Line Items
    const itemDetailsText = cart
      .map(
        (item: any) =>
          `• ${item.name} (x${item.quantity}) - Rs. ${(
            item.price * item.quantity
          ).toFixed(0)}`
      )
      .join("\n");

    const fullAddressString = customerCity 
      ? `${customerAddress}, ${customerCity}` 
      : customerAddress;

    const formattedPaymentMethod = paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment";

    // 6. Save the order to Supabase
    try {
      const { error } = await supabaseAdmin.from("orders").insert({
        order_id: orderId,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: rawEmail || null,
        address: fullAddressString,
        items: itemDetailsText.replace(/\n/g, "; "),
        payment_method: formattedPaymentMethod,
        total: grandTotal,
      });

      if (error) {
        console.error("Failed to save order to Supabase:", error);
      }
    } catch (err) {
      console.error("Database insert error:", err);
    }

    // 7. Email Order Details to Store Owner via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    const ownerEmail = process.env.OWNER_EMAIL;

    if (resendApiKey && ownerEmail) {
      try {
        const resend = new Resend(resendApiKey);
        const { error: emailError } = await resend.emails.send({
          from: "EcoGleam Orders <onboarding@resend.dev>",
          to: ownerEmail,
          subject: `New Order #${orderId} — Rs. ${grandTotal.toFixed(0)}`,
          text: `Customer: ${customerName}\nPhone: ${customerPhone}\nEmail: ${rawEmail || "Not provided"}\nAddress: ${fullAddressString}\n\nItems:\n${itemDetailsText}\n\nSubtotal: Rs. ${subtotal.toFixed(0)}\nShipping: Rs. ${shipping}\nTotal: Rs. ${grandTotal.toFixed(0)}\nPayment: ${formattedPaymentMethod}`,
        });

        if (emailError) {
          console.error(`Order ${orderId}: Resend rejected the email:`, emailError);
        }
      } catch (err) {
        console.error(`Order ${orderId}: Failed to send order email:`, err);
      }
    } else {
      console.warn(
        `Order ${orderId}: RESEND_API_KEY or OWNER_EMAIL is missing — no email sent.`
      );
    }

    return NextResponse.json({
      success: true,
      orderId,
      amountPaid: grandTotal.toFixed(0),
      customerPhone,
      paymentMethod,
      message: "Order processed successfully!",
    });
  } catch (error) {
    console.error("Checkout Processing Error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred during checkout." },
      { status: 500 }
    );
  }
}