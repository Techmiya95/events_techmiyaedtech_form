import { DEFAULT_EVENTS } from '../utils/eventsData';

const GAS_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbz9speekojPCeVoWxMRdStfCozsq3CuGzgOMfwg49TdusNyTYZer_O8mfmm6WdG8p-n/exec";

// Fetch dynamic event list from backend with fallback
export const getEvents = async () => {
  if (!GAS_URL) {
    return DEFAULT_EVENTS;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch(`${GAS_URL}?action=getEvents`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const result = await response.json();
      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        return result.data;
      }
    }
    return DEFAULT_EVENTS;
  } catch (error) {
    console.warn("Could not load events from backend, using default events:", error.message);
    return DEFAULT_EVENTS;
  }
};

// Function to handle API requests to Google Apps Script
export const submitRegistration = async (data) => {
  if (!GAS_URL) {
    console.warn("GAS_URL not found, using mock successful response for development.");
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ success: true, registrationId: data.registrationId });
      }, 1500);
    });
  }

  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ 
        action: 'register', 
        registrationId: data.registrationId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        event: data.event,
        location: data.location,
        candidateType: data.candidateType,
        ticketImage: data.ticketImage || null
      }),
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // GAS requires text/plain to avoid CORS preflight blocks
      }
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error('Failed to connect to the server. Please check your internet connection.');
  }
};

export const verifyAttendee = async (registrationId) => {
  if (!GAS_URL) {
    return new Promise((resolve) => setTimeout(() => resolve({
      success: true,
      data: {
        registrationId,
        fullName: "Sample Attendee",
        email: "sample@example.com",
        phone: "+91 9876543210",
        event: "FestPitch 2026",
        location: "Bangalore",
        candidateType: "Working Professional",
        attendanceStatus: "Pending"
      }
    }), 1000));
  }

  try {
    const response = await fetch(`${GAS_URL}?action=verify&id=${registrationId}`);
    return await response.json();
  } catch (error) {
    throw new Error('Failed to verify attendee');
  }
};

export const markAttendance = async (registrationId) => {
  if (!GAS_URL) return { success: true };
  
  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'markAttendance', registrationId }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    });
    return await response.json();
  } catch (error) {
    throw new Error('Failed to mark attendance');
  }
};

export const getAllRegistrations = async () => {
  if (!GAS_URL) return { success: true, data: [] };
  
  try {
    const response = await fetch(`${GAS_URL}?action=getAll`);
    return await response.json();
  } catch (error) {
    throw new Error('Failed to fetch registrations');
  }
};

// Function to handle Workshop Registrations (GenAI Workshop)
export const submitWorkshopRegistration = async (data) => {
  if (!GAS_URL) {
    console.warn("GAS_URL not found, using mock success response.");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, registrationId: data.registrationId });
      }, 1500);
    });
  }

  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'registerWorkshop',
        registrationId: data.registrationId,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        workshop: data.workshop || "GenAI Workshop",
        timing: data.timing || "November 6, 7, 8, 2026 • 10:00 AM - 5:00 PM IST",
        mode: data.mode, // "Online" or "Offline"
        fee: data.fee,   // "₹499" or "₹599"
        payOffline: data.payOffline || false,
        paymentScreenshot: data.paymentScreenshot || null,
        ticketImage: data.ticketImage || null
      }),
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      }
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Workshop Registration API Error:", error);
    throw new Error('Failed to connect to the server. Please check your internet connection.');
  }
};

