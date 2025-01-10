import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { name, email, message } = req.body;

    // Configurar transporte do nodemailer
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // Servidor SMTP do Gmail
      port: 587, // Porta para STARTTLS
      secure: false, // STARTTLS
      auth: {
        user: process.env.SMTP_USER, // Seu e-mail
        pass: process.env.SMTP_PASS, // Senha específica de aplicativo
      },
    });

    try {
      await transporter.sendMail({
        from: `"${name}" <${email}>`, // Nome e e-mail do remetente (preenchido no formulário)
        to: "alef_rdl@hotmail.com", // Substitua pelo e-mail que você deseja receber as mensagens
        subject: `New message AlefDevops ${name}`, // Assunto do e-mail
        text: `Você recebeu uma nova mensagem de contato:\n\nDe: ${name} <${email}>\n\nMensagem:\n${message}`, // Corpo do e-mail
      });

      res.status(200).json({ message: "E-mail enviado com sucesso!" });
    } catch (error) {
      console.error("Erro ao enviar e-mail:", error); // Log detalhado do erro
      res.status(500).json({ message: `Erro ao enviar e-mail: ${error.message}` });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Método ${req.method} não permitido`);
  }
}
