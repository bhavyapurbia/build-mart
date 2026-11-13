import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    siteName: 'BuildMart',
    tagline: 'Direct Site Procurement & Express Construction Materials Platform',
    whatsappNumber: '+919876543210',
    supportPhone: '1800-890-5000',
    supportEmail: 'orders@buildmart.in',
    officeAddress: 'BuildMart Fulfillment Hub 01, Outer Ring Road, Bengaluru 560103',
    announcementBar: '⚡ 30-60 Minute Direct Job-Site Delivery in Bengaluru | Genuine Certified Construction Supplies',
    freeDeliveryThreshold: 5000,
    cities: ['Bengaluru', 'Mumbai', 'Hyderabad', 'Delhi NCR', 'Pune', 'Chennai'],
    sellerGstin: '29AABCB1234F1Z5',
    sellerState: 'Karnataka',
    socialLinks: {
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
      linkedin: 'https://linkedin.com'
    },
    heroBanners: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings/public');
        const data = res.data?.data || res.data;
        if (data && typeof data === 'object') {
          setSettings(prev => ({ ...prev, ...data }));
          if (data.themeAccent) {
            document.documentElement.style.setProperty('--primary', data.themeAccent);
          }
        }
      } catch (err) {
        console.warn('Could not load site settings, using defaults.', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

