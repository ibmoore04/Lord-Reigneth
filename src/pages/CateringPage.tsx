import { useState } from 'react';
import { SEO, CateringFAQSchema, BreadcrumbSchema } from '../components/layout/SEO';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Button } from '../components/ui/Button';
import { WhatsAppButton } from '../components/ui/WhatsAppButton';
import { CheckCircle, Users, Calendar, ChefHat, Heart, Briefcase, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import type { CateringEnquiry, EventType } from '../types';
import { submitCateringRequest } from '../services/cateringService';

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'wedding', label: 'Wedding' },
  { value: 'birthday', label: 'Birthday Party' },
  { value: 'corporate', label: 'Corporate Event' },
  { value: 'party', label: 'General Party' },
  { value: 'celebration', label: 'Celebration' },
  { value: 'milestone', label: 'Milestone Event' },
  { value: 'other', label: 'Other' },
];

const EVENT_CATEGORIES = [
  { icon: Heart, label: 'Weddings', desc: 'Make your special day unforgettable with great Nigerian food.' },
  { icon: Star, label: 'Birthdays', desc: 'Celebrate milestones with dishes your guests will talk about.' },
  { icon: Briefcase, label: 'Corporate Events', desc: 'Professional outdoor catering for your team or clients.' },
  { icon: Users, label: 'Parties & Gatherings', desc: 'Any occasion, any size — we bring the food.' },
];

const EMPTY_FORM: CateringEnquiry = {
  fullName: '',
  phone: '',
  email: '',
  eventType: 'wedding',
  eventDate: '',
  numberOfGuests: '',
  eventLocation: '',
  additionalInfo: '',
};

type FormErrors = Partial<Record<keyof CateringEnquiry, string>>;

function validate(data: CateringEnquiry): FormErrors {
  const errors: FormErrors = {};
  if (!data.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!data.phone.trim()) errors.phone = 'Phone number is required.';
  if (!data.email.trim()) errors.email = 'Email address is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Please enter a valid email.';
  if (!data.eventDate) errors.eventDate = 'Event date is required.';
  if (!data.numberOfGuests.trim()) errors.numberOfGuests = 'Number of guests is required.';
  if (!data.eventLocation.trim()) errors.eventLocation = 'Event location is required.';
  return errors;
}

export function CateringPage() {
  const [form, setForm] = useState<CateringEnquiry>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof CateringEnquiry]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstErrorKey = Object.keys(errs)[0];
      document.getElementById(firstErrorKey)?.focus();
      return;
    }
    try {
      await submitCateringRequest({
        name: form.fullName,
        phone: form.phone,
        email: form.email,
        event_type: form.eventType,
        event_date: form.eventDate,
        guest_count: parseInt(form.numberOfGuests, 10),
        event_location: form.eventLocation,
        message: form.additionalInfo ?? null,
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setErrors({ fullName: 'Unable to submit. Please try again or contact us directly.' });
    }
  }

  const inputClass = (field: keyof CateringEnquiry) =>
    `w-full px-4 py-3 rounded-md border text-charcoal-800 bg-white text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
      errors[field] ? 'border-red-400' : 'border-cream-300 hover:border-primary-300'
    }`;

  return (
    <>
      <SEO
        title="Catering Services"
        description="Lord Reigneth Foods outdoor catering — authentic Nigerian cuisine for weddings, birthdays, corporate events and all celebrations. Based in Ijebu Ode, Ogun State."
        canonical="/catering"
        keywords="outdoor catering Ijebu Ode, wedding catering Nigeria, event catering Ogun State, Nigerian food catering"
      />
      <CateringFAQSchema />
      <BreadcrumbSchema items={[{ name: 'Catering', href: '/catering' }]} />

      <main id="main-content" className="pt-16 lg:pt-20">
        {/* Hero */}
        <div className="bg-primary-800 py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <p className="text-gold-400 text-sm font-semibold tracking-widest uppercase mb-4">
                Outdoor Catering
              </p>
              <h1 className="font-display font-bold text-white text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6">
                Your Event Deserves
                <br />
                Great Food.
              </h1>
              <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto">
                Lord Reigneth Foods brings authentic Nigerian cuisine to your celebrations — wherever
                you are in the Ijebu Ode area.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Event Categories */}
        <section className="bg-cream-100 py-16 lg:py-20" aria-labelledby="event-types-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              id="event-types-heading"
              label="We Cater For"
              title="Any Occasion, Any Size"
              subtitle="From intimate family gatherings to large-scale events — we bring the same quality and care every time."
            />
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {EVENT_CATEGORIES.map((cat, i) => {
                const Icon = cat.icon;
                return (
                  <motion.div
                    key={cat.label}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="bg-white rounded-xl p-6 text-center border border-cream-200 hover:border-primary-200 hover:shadow-md transition-all duration-300"
                  >
                    <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-primary-700" aria-hidden="true" />
                    </div>
                    <h3 className="font-semibold text-charcoal-800 mb-2">{cat.label}</h3>
                    <p className="text-sm text-charcoal-500 leading-relaxed">{cat.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* What to Expect */}
        <section className="bg-white py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-3">
                  Our Service
                </p>
                <h2 className="font-display font-bold text-charcoal-800 text-3xl sm:text-4xl mb-6">
                  What You Can Expect
                </h2>
                <div className="space-y-4">
                  {[
                    'Authentic Nigerian dishes prepared fresh for your event',
                    'Professional, reliable outdoor catering setup',
                    'Flexible menu options to suit your event',
                    'Experienced in weddings, parties, and corporate events',
                    'Serving the Ijebu Ode area and beyond',
                  ].map((point) => (
                    <div key={point} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary-600 mt-0.5 shrink-0" aria-hidden="true" />
                      <span className="text-charcoal-600">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-primary-50 rounded-2xl p-8 flex flex-col items-center text-center gap-5">
                <ChefHat className="w-16 h-16 text-primary-700" aria-hidden="true" />
                <h3 className="font-display font-bold text-2xl text-charcoal-800">
                  Ready to Talk?
                </h3>
                <p className="text-charcoal-600 text-sm">
                  Contact us directly to discuss your event — we'll work with you to plan the
                  perfect menu.
                </p>
                <WhatsAppButton
                  variant="inline"
                  message="Hello Lord Reigneth Foods, I am interested in catering services for my event."
                  label="Chat on WhatsApp"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Enquiry Form */}
        <section className="bg-cream-100 py-16 lg:py-24" aria-labelledby="enquiry-form-heading">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              id="enquiry-form-heading"
              label="Get in Touch"
              title="Catering Enquiry"
              subtitle="Fill in the form below and we'll be in touch to discuss your event requirements."
            />

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="mt-12 bg-white rounded-2xl p-10 text-center border border-cream-200"
              >
                <CheckCircle className="w-16 h-16 text-primary-600 mx-auto mb-5" aria-hidden="true" />
                <h3 className="font-display font-bold text-2xl text-charcoal-800 mb-3">
                  Enquiry Received!
                </h3>
                <p className="text-charcoal-600 mb-6">
                  Thank you for your catering enquiry. We'll review your details and get back to you
                  shortly. You can also reach us directly on WhatsApp for a faster response.
                </p>
                <WhatsAppButton
                  variant="inline"
                  message="Hello Lord Reigneth Foods, I just submitted a catering enquiry and wanted to follow up."
                  label="Follow Up on WhatsApp"
                />
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="mt-12 bg-white rounded-2xl p-6 sm:p-10 border border-cream-200"
                aria-labelledby="enquiry-form-heading"
              >
                <p className="text-sm text-charcoal-400 mb-8 italic">
                  * All fields marked with an asterisk are required.
                  This form does not yet submit data automatically — after submission, we'll advise you to
                  follow up via WhatsApp or phone to confirm your enquiry.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label htmlFor="fullName" className="block text-sm font-medium text-charcoal-700 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      required
                      value={form.fullName}
                      onChange={handleChange}
                      className={inputClass('fullName')}
                      aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                    />
                    {errors.fullName && (
                      <p id="fullName-error" className="mt-1 text-xs text-red-500" role="alert">{errors.fullName}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-charcoal-700 mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={form.phone}
                      onChange={handleChange}
                      className={inputClass('phone')}
                      aria-describedby={errors.phone ? 'phone-error' : undefined}
                    />
                    {errors.phone && (
                      <p id="phone-error" className="mt-1 text-xs text-red-500" role="alert">{errors.phone}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-charcoal-700 mb-1.5">
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
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {errors.email && (
                      <p id="email-error" className="mt-1 text-xs text-red-500" role="alert">{errors.email}</p>
                    )}
                  </div>

                  {/* Event Type */}
                  <div>
                    <label htmlFor="eventType" className="block text-sm font-medium text-charcoal-700 mb-1.5">
                      Event Type *
                    </label>
                    <select
                      id="eventType"
                      name="eventType"
                      value={form.eventType}
                      onChange={handleChange}
                      className={inputClass('eventType')}
                    >
                      {EVENT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Event Date */}
                  <div>
                    <label htmlFor="eventDate" className="block text-sm font-medium text-charcoal-700 mb-1.5">
                      Event Date *
                    </label>
                    <input
                      id="eventDate"
                      name="eventDate"
                      type="date"
                      required
                      value={form.eventDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className={inputClass('eventDate')}
                      aria-describedby={errors.eventDate ? 'eventDate-error' : undefined}
                    />
                    {errors.eventDate && (
                      <p id="eventDate-error" className="mt-1 text-xs text-red-500" role="alert">{errors.eventDate}</p>
                    )}
                  </div>

                  {/* Number of Guests */}
                  <div>
                    <label htmlFor="numberOfGuests" className="block text-sm font-medium text-charcoal-700 mb-1.5">
                      Number of Guests *
                    </label>
                    <input
                      id="numberOfGuests"
                      name="numberOfGuests"
                      type="number"
                      min="1"
                      required
                      value={form.numberOfGuests}
                      onChange={handleChange}
                      className={inputClass('numberOfGuests')}
                      aria-describedby={errors.numberOfGuests ? 'numberOfGuests-error' : undefined}
                    />
                    {errors.numberOfGuests && (
                      <p id="numberOfGuests-error" className="mt-1 text-xs text-red-500" role="alert">{errors.numberOfGuests}</p>
                    )}
                  </div>

                  {/* Event Location */}
                  <div className="sm:col-span-2">
                    <label htmlFor="eventLocation" className="block text-sm font-medium text-charcoal-700 mb-1.5">
                      Event Location *
                    </label>
                    <input
                      id="eventLocation"
                      name="eventLocation"
                      type="text"
                      required
                      value={form.eventLocation}
                      onChange={handleChange}
                      placeholder="e.g. Community Hall, Ijebu Ode"
                      className={inputClass('eventLocation')}
                      aria-describedby={errors.eventLocation ? 'eventLocation-error' : undefined}
                    />
                    {errors.eventLocation && (
                      <p id="eventLocation-error" className="mt-1 text-xs text-red-500" role="alert">{errors.eventLocation}</p>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="sm:col-span-2">
                    <label htmlFor="additionalInfo" className="block text-sm font-medium text-charcoal-700 mb-1.5">
                      Additional Information
                    </label>
                    <textarea
                      id="additionalInfo"
                      name="additionalInfo"
                      rows={4}
                      value={form.additionalInfo}
                      onChange={handleChange}
                      placeholder="Tell us more about your event — preferred dishes, special requirements, etc."
                      className={`${inputClass('additionalInfo')} resize-none`}
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <Button type="submit" fullWidth size="lg">
                    <Calendar className="w-5 h-5" aria-hidden="true" />
                    Submit Enquiry
                  </Button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
