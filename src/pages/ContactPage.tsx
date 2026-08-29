import { useState } from 'react';
import { SEO } from '../components/layout/SEO';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Button } from '../components/ui/Button';
import { WhatsAppButton } from '../components/ui/WhatsAppButton';
import { Phone, MapPin, Clock, Music2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { SITE_CONFIG, getTelLink, getWhatsAppLink } from '../config/site';
import type { ContactFormData } from '../types';
import { submitContactMessage } from '../services/contactService';

const EMPTY_FORM: ContactFormData = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

type FormErrors = Partial<Record<keyof ContactFormData, string>>;

function validate(data: ContactFormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.name.trim()) errors.name = 'Your name is required.';
  if (!data.email.trim()) errors.email = 'Email address is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = 'Please enter a valid email address.';
  if (!data.subject.trim()) errors.subject = 'Please provide a subject.';
  if (!data.message.trim()) errors.message = 'Your message is required.';
  return errors;
}

const INFO_ITEMS = [
  {
    icon: Phone,
    label: 'Phone',
    content: SITE_CONFIG.contact.phone,
    href: getTelLink(),
  },
  {
    icon: MapPin,
    label: 'Main Address',
    content: SITE_CONFIG.address.main,
    href: SITE_CONFIG.schema.hasMap,
    isExternal: true,
  },
  {
    icon: Clock,
    label: 'Opening Hours',
    content: `${SITE_CONFIG.hours.weekdays}\n${SITE_CONFIG.hours.weekend}`,
    href: null,
  },
];

export function ContactPage() {
  const [form, setForm] = useState<ContactFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstKey = Object.keys(errs)[0];
      document.getElementById(firstKey)?.focus();
      return;
    }
    try {
      await submitContactMessage({
        name: form.name,
        email: form.email,
        phone: form.phone ?? null,
        subject: form.subject,
        message: form.message,
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setErrors({ message: 'Unable to send message. Please try again or contact us directly.' });
    }
  }

  const inputClass = (field: keyof ContactFormData) =>
    [
      'w-full px-4 py-3 rounded-md border text-charcoal-800 bg-white text-sm',
      'transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500',
      errors[field]
        ? 'border-red-400'
        : 'border-cream-300 hover:border-primary-300',
    ].join(' ');

  return (
    <>
      <SEO
        title="Contact Us"
        description="Get in touch with Lord Reigneth Foods — call us, send a WhatsApp message, or use our contact form. Located at 13, Old Ondo Benin Road, Ijebu Ode."
        canonical="/contact"
      />

      <main id="main-content" className="pt-16 lg:pt-20">
        {/* Page Header */}
        <div className="bg-primary-800 py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              label="Get In Touch"
              title="Contact Us"
              subtitle="We'd love to hear from you — whether it's an order, a catering enquiry, or just a hello."
              light
            />
          </div>
        </div>

        {/* Main Content */}
        <section className="bg-cream-100 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
              {/* Contact Information */}
              <div className="lg:col-span-2 space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="font-display font-bold text-charcoal-800 text-2xl sm:text-3xl mb-6">
                    We're Here For You
                  </h2>

                  <div className="space-y-5">
                    {INFO_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const contentLines = item.content.split('\n');
                      return (
                        <div key={item.label} className="flex items-start gap-4">
                          <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                            <Icon
                              className="w-5 h-5 text-primary-700"
                              aria-hidden="true"
                            />
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-charcoal-400 mb-1">
                              {item.label}
                            </p>
                            {item.href ? (
                              <a
                                href={item.href}
                                target={item.isExternal ? '_blank' : undefined}
                                rel={
                                  item.isExternal
                                    ? 'noopener noreferrer'
                                    : undefined
                                }
                                className="text-charcoal-700 text-sm hover:text-primary-700 transition-colors duration-200 leading-relaxed"
                              >
                                {contentLines.map((line, i) => (
                                  <span key={i} className="block">
                                    {line}
                                  </span>
                                ))}
                              </a>
                            ) : (
                              <div className="text-charcoal-700 text-sm leading-relaxed">
                                {contentLines.map((line, i) => (
                                  <span key={i} className="block">
                                    {line}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* WhatsApp CTA */}
                <motion.div
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="bg-primary-700 rounded-2xl p-6 text-white"
                >
                  <p className="text-gold-400 text-xs font-semibold tracking-widest uppercase mb-2">
                    Quickest Response
                  </p>
                  <h3 className="font-display font-bold text-xl mb-3">
                    Chat on WhatsApp
                  </h3>
                  <p className="text-white/70 text-sm mb-5 leading-relaxed">
                    For orders, catering enquiries or general questions — WhatsApp
                    is the fastest way to reach us.
                  </p>
                  <WhatsAppButton
                    variant="inline"
                    label="Open WhatsApp"
                    className="w-full justify-center"
                  />
                </motion.div>

                {/* Social links */}
                <motion.div
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: 0.25 }}
                >
                  <p className="text-sm font-semibold text-charcoal-500 mb-3">
                    Follow Us
                  </p>
                  <div className="flex items-center gap-3">
                    <a
                      href={SITE_CONFIG.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Lord Reigneth Foods on Instagram"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-white border border-cream-200 text-charcoal-600 text-sm font-medium hover:border-primary-300 hover:text-primary-700 transition-colors duration-200"
                    >
                      {/* Instagram icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                      Instagram
                    </a>
                    <a
                      href={SITE_CONFIG.social.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Lord Reigneth Foods on TikTok"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-white border border-cream-200 text-charcoal-600 text-sm font-medium hover:border-primary-300 hover:text-primary-700 transition-colors duration-200"
                    >
                      <Music2 className="w-4 h-4" aria-hidden="true" />
                      TikTok
                    </a>
                  </div>
                </motion.div>
              </div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-3"
              >
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-2xl p-10 text-center border border-cream-200 shadow-sm"
                  >
                    <CheckCircle
                      className="w-16 h-16 text-primary-600 mx-auto mb-5"
                      aria-hidden="true"
                    />
                    <h3 className="font-display font-bold text-2xl text-charcoal-800 mb-3">
                      Message Received!
                    </h3>
                    <p className="text-charcoal-600 mb-6 leading-relaxed">
                      Thank you for reaching out to Lord Reigneth Foods. We'll
                      get back to you as soon as possible. For a faster response,
                      reach us directly on WhatsApp.
                    </p>
                    <WhatsAppButton
                      variant="inline"
                      label="Continue on WhatsApp"
                      className="mx-auto"
                    />
                  </motion.div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    noValidate
                    aria-label="Contact form"
                    className="bg-white rounded-2xl p-6 sm:p-10 border border-cream-200 shadow-sm"
                  >
                    <h2 className="font-display font-bold text-2xl text-charcoal-800 mb-2">
                      Send Us a Message
                    </h2>
                    <p className="text-sm text-charcoal-400 mb-8 italic">
                      * Required fields. This form does not yet submit automatically
                      — please follow up via WhatsApp or phone to confirm.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Name */}
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-charcoal-700 mb-1.5"
                        >
                          Your Name *
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          required
                          value={form.name}
                          onChange={handleChange}
                          className={inputClass('name')}
                          aria-describedby={
                            errors.name ? 'name-error' : undefined
                          }
                        />
                        {errors.name && (
                          <p
                            id="name-error"
                            className="mt-1 text-xs text-red-500"
                            role="alert"
                          >
                            {errors.name}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-charcoal-700 mb-1.5"
                        >
                          Email Address *
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={form.email}
                          onChange={handleChange}
                          className={inputClass('email')}
                          aria-describedby={
                            errors.email ? 'email-error' : undefined
                          }
                        />
                        {errors.email && (
                          <p
                            id="email-error"
                            className="mt-1 text-xs text-red-500"
                            role="alert"
                          >
                            {errors.email}
                          </p>
                        )}
                      </div>

                      {/* Phone (optional) */}
                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-charcoal-700 mb-1.5"
                        >
                          Phone Number{' '}
                          <span className="text-charcoal-400 font-normal">
                            (optional)
                          </span>
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          value={form.phone}
                          onChange={handleChange}
                          className={inputClass('phone')}
                        />
                      </div>

                      {/* Subject */}
                      <div>
                        <label
                          htmlFor="subject"
                          className="block text-sm font-medium text-charcoal-700 mb-1.5"
                        >
                          Subject *
                        </label>
                        <input
                          id="subject"
                          name="subject"
                          type="text"
                          required
                          value={form.subject}
                          onChange={handleChange}
                          placeholder="e.g. Catering enquiry, Menu question…"
                          className={inputClass('subject')}
                          aria-describedby={
                            errors.subject ? 'subject-error' : undefined
                          }
                        />
                        {errors.subject && (
                          <p
                            id="subject-error"
                            className="mt-1 text-xs text-red-500"
                            role="alert"
                          >
                            {errors.subject}
                          </p>
                        )}
                      </div>

                      {/* Message */}
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="message"
                          className="block text-sm font-medium text-charcoal-700 mb-1.5"
                        >
                          Message *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          rows={5}
                          required
                          value={form.message}
                          onChange={handleChange}
                          placeholder="Tell us how we can help you…"
                          className={`${inputClass('message')} resize-none`}
                          aria-describedby={
                            errors.message ? 'message-error' : undefined
                          }
                        />
                        {errors.message && (
                          <p
                            id="message-error"
                            className="mt-1 text-xs text-red-500"
                            role="alert"
                          >
                            {errors.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-8">
                      <Button type="submit" fullWidth size="lg">
                        Send Message
                      </Button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Quick Contact Strip */}
        <section className="bg-primary-800 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-gold-400 text-xs font-semibold tracking-widest uppercase mb-1">
                  Need an immediate answer?
                </p>
                <p className="text-white text-lg font-semibold">
                  Call us directly
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={getTelLink()}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-md bg-white text-primary-800 font-semibold text-sm hover:bg-cream-100 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  {SITE_CONFIG.contact.phone}
                </a>
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-md bg-[#25D366] text-white font-semibold text-sm hover:bg-[#1ebe5e] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
