import type { Location } from '../types';
import { SITE_CONFIG } from '../config/site';

export const LOCATIONS: Location[] = [
  {
    id: 'main',
    name: 'Main Outlet',
    description:
      'Our flagship restaurant — the heart of Lord Reigneth Foods. Dine in or pack out your favourite Nigerian meals.',
    address: '13, Old Ondo Benin Road, Ijebu Ode, Ogun State',
    areaDescription: 'Old Ondo Benin Road, Ijebu Ode',
    phone: SITE_CONFIG.contact.phone,
    hours: 'Mon – Sat: 7:00 AM – 9:00 PM | Sunday: Closed',
    directionsUrl:
      'https://maps.google.com/?q=13+Old+Ondo+Benin+Road+Ijebu+Ode+Ogun+State+Nigeria',
    isPrimary: true,
  },
  {
    id: 'lagos-garage',
    name: 'Lagos Garage',
    description:
      'A popular quick-service location serving travellers and residents on the go. Our Lagos Garage outlet brings the Lord Reigneth Foods taste to a wider audience.',
    areaDescription: 'Lagos Garage, Ijebu Ode',
    phone: SITE_CONFIG.contact.phone,
    hours: 'Mon – Sat: 7:00 AM – 9:00 PM | Sunday: Closed',
    directionsUrl: 'https://maps.google.com/?q=Lagos+Garage+Ijebu+Ode+Ogun+State+Nigeria',
  },
  {
    id: 'ilese',
    name: 'Ilese Outlet',
    description:
      'Serving the Ilese community — students, residents and visitors alike. Authentic Nigerian food, close to home.',
    areaDescription: 'Ilese, Ijebu Area',
    phone: SITE_CONFIG.contact.phone,
    hours: 'Mon – Sat: 7:00 AM – 9:00 PM | Sunday: Closed',
    directionsUrl: 'https://maps.google.com/?q=Ilese+Ijebu+Ogun+State+Nigeria',
  },
];
