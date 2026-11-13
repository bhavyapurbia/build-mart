import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, MessageSquare } from 'lucide-react';
import api from '../utils/api';
import { useSettings } from '../context/SettingsContext';
import { useNotification } from '../context/NotificationContext';

export default function ContactPage() {
  const { settings } = useSettings();
  const { showToast } = useNotification();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) {
      showToast('Please fill in your name, phone number, and message.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/contact', formData);
      setSubmitted(true);
      showToast('Thank you! Your message has been received.', 'success');
      setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send message. Please try again or WhatsApp us.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1000px', padding: '40px 16px', minHeight: '65vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px' }}>
          Contact BuildMart Materials Desk
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
          Have questions about material specifications, bulk site deliveries, or contractor billing? Reach our dispatch engineers today.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
        {/* Contact Information Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              padding: '24px',
              backgroundColor: 'var(--bg-card, #FFFFFF)',
              borderRadius: '12px',
              border: '1px solid var(--border-light, #E5E7EB)'
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px', color: 'var(--text-primary)' }}>
              Head Office & Fulfillment Yard
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <MapPin size={20} color="var(--primary, #0284C7)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{settings?.officeAddress || 'BuildMart Fulfillment Hub 01, Outer Ring Road, Bengaluru 560103'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Phone size={20} color="var(--primary, #0284C7)" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Toll-Free:</strong>{' '}
                  <a href={`tel:${settings?.supportPhone || '18008905000'}`} style={{ color: 'inherit' }}>
                    {settings?.supportPhone || '1800-890-5000'}
                  </a>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mail size={20} color="var(--primary, #0284C7)" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Email:</strong>{' '}
                  <a href={`mailto:${settings?.supportEmail || 'orders@buildmart.in'}`} style={{ color: 'inherit' }}>
                    {settings?.supportEmail || 'orders@buildmart.in'}
                  </a>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Clock size={20} color="var(--color-success, #10B981)" style={{ flexShrink: 0 }} />
                <span>Mon - Sun: 6:00 AM - 10:00 PM Dispatch Desk</span>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '24px',
              backgroundColor: 'var(--bg-accent-subtle, #F0FDF4)',
              borderRadius: '12px',
              border: '1px solid var(--border-accent, #BBF7D0)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <MessageSquare size={22} color="var(--color-success, #16A34A)" />
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Instant WhatsApp Support
              </h4>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Need fast quote turnaround or urgent job-site delivery tracking? Connect directly with our on-duty materials manager.
            </p>
            <a
              href={`https://wa.me/${(settings?.whatsappNumber || '919876543210').replace(/\+/g, '')}?text=Hello%20BuildMart%20Support,%20I%20have%20an%20enquiry%20regarding%20construction%20materials.`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--color-success, #16A34A)',
                color: '#FFFFFF',
                padding: '10px 18px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                textDecoration: 'none'
              }}
            >
              <MessageSquare size={16} /> Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div
          style={{
            padding: '32px',
            backgroundColor: 'var(--bg-card, #FFFFFF)',
            borderRadius: '12px',
            border: '1px solid var(--border-light, #E5E7EB)'
          }}
        >
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '40px 16px' }}>
              <CheckCircle size={48} color="var(--color-success, #16A34A)" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px' }}>Message Received!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 20px' }}>
                Thank you for contacting BuildMart. Our materials desk will get back to you within 30 minutes during working hours.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', borderRadius: '6px' }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Send Us a Message
              </h3>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Rajesh Kumar"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light, #D1D5DB)',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+91 98765 43210"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light, #D1D5DB)',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="rajesh@construction.com"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light, #D1D5DB)',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Subject / Requirement
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g. Quotation for 500 bags OPC 53 cement"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light, #D1D5DB)',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Message Details *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Describe your site location, material grades, expected delivery date, or questions..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light, #D1D5DB)',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                <Send size={16} />
                {submitting ? 'Sending...' : 'Submit Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

