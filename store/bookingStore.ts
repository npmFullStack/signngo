// store/bookingStore.ts
import { create } from 'zustand';
import axios from 'axios';
import { showErrorAlert } from '../utils/helpers';

interface Booking {
  id: string;
  booking_number: string;
  hwb_number: string;
  status: string;
  shipper: string;
  consignee: string;
  origin_port: string;
  destination_port: string;
  pickup_province?: string | null;
  pickup_city?: string | null;
  pickup_barangay?: string | null;
  pickup_street?: string | null;
  delivery_province?: string | null;
  delivery_city?: string | null;
  delivery_barangay?: string | null;
  delivery_street?: string | null;
  created_at: string;
}

interface BookingStore {
  currentBooking: Booking | null;
  loading: boolean;
  error: string | null;

  searchBooking: (query: string) => Promise<void>;
  updateBookingStatus: (id: string, status: string) => Promise<boolean>;
  retryFetch: () => void;
}

const API_BASE_URL = 'http://localhost:5000/couriers';

export const useBookingStore = create<BookingStore>((set, get) => ({
  currentBooking: null,
  loading: false,
  error: null,

  searchBooking: async (query: string) => {
    if (!query.trim()) {
      showErrorAlert('Error', 'Please enter a booking or HWB number');
      return;
    }

    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API_BASE_URL}/public/search/${query.trim()}`);
      set({ currentBooking: res.data.booking, loading: false });
    } catch (err: any) {
      console.error('Search booking error:', err);
      set({ error: err.message, currentBooking: null, loading: false });
      showErrorAlert('Error', 'Failed to search booking. Please try again.');
    }
  },

  updateBookingStatus: async (id: string, status: string) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.put(`${API_BASE_URL}/${id}/status`, { status });
      set({ currentBooking: res.data.booking, loading: false });
      return true;
    } catch (err: any) {
      console.error('Update status error:', err);
      set({ error: err.message, loading: false });
      showErrorAlert('Error', 'Failed to update booking status');
      return false;
    }
  },

  retryFetch: () => {
    const booking = get().currentBooking;
    if (booking) {
      get().searchBooking(booking.booking_number);
    }
  }
}));
