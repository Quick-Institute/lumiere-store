import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react";
import "./About.css";
import "./Contact.css";

const info = [
  { icon: MapPin, title: "Visit us", text: "No. 245, wellawatta Road, Colombo, Sri Lanka" },
  { icon: Phone, title: "Call us", text: "+94 77 000 0000" },
  { icon: Mail, title: "Email us", text: "hello@lumiere.lk" },
  { icon: Clock, title: "Opening hours", text: "Mon – Sat: 9:00 AM – 7:00 PM" },
];

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Demo only: the message will be sent to the back end later
    setSent(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="label">We'd love to hear from you</p>
          <h1>
            Contact <span className="script">Us</span>
          </h1>
          <p className="page-sub">Questions, orders or feedback? Send us a message.</p>
        </div>
      </section>

      <section className="container contact-layout">
        <div className="contact-info">
          {info.map((i) => (
            <div key={i.title} className="info-card">
              <div className="value-icon">
                <i.icon size={22} />
              </div>
              <div>
                <h4>{i.title}</h4>
                <p>{i.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="contact-form-wrap">
          <h2>Send a message</h2>

          {sent && (
            <div className="sent-msg">
              <CheckCircle size={18} /> Thank you! We'll get back to you soon.
            </div>
          )}

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-row">
              <input
                type="text"
                name="name"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Your email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={form.subject}
              onChange={handleChange}
              required
            />
            <textarea
              name="message"
              rows="6"
              placeholder="Write your message here"
              value={form.message}
              onChange={handleChange}
              required
            />
            <button type="submit" className="btn send-btn">
              <Send size={16} /> Send Message
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

export default Contact;
