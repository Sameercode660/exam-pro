import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import prisma from "@/utils/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method not allowed" });

  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email is required" });

  try {
    const participant = await prisma.participant.findUnique({ where: { email } });

    if (!participant)
      return res.status(404).json({ success: false, message: "No user found with this email" });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Admin" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Your Account Password",
      html: `<p>Hello ${participant.name || ""},</p>
             <p>Your password is: <strong>${participant.password}</strong></p>
             <p>Please do not share this with anyone.</p>`,
    });

    return res.status(200).json({ success: true, message: "Password sent" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
