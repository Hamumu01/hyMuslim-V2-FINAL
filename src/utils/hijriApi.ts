// src/utils/hijriApi.ts
import axios from 'axios';

export interface HijriToday {
  day: string;
  date: string;
  month: string;
  year: string;
}

export async function fetchHijriToday(): Promise<HijriToday | null> {
  try {
    const res = await axios.get('https://api.myquran.com/v2/cal/hijr/?adj=-1');
    // Example API response: { data: { day: 'Selasa', date: '14', month: 'Ramadhan', year: '1446' } }
    if (res.data && res.data.data) {
      return res.data.data;
    }
    return null;
  } catch (err) {
    return null;
  }
}

export async function fetchHijriByDate(date: string): Promise<HijriToday | null> {
  try {
    const res = await axios.get(`https://api.myquran.com/v2/cal/hijr/${date}?adj=-1`);
    if (res.data && res.data.data) {
      return res.data.data;
    }
    return null;
  } catch (err) {
    return null;
  }
}

export async function fetchHijriDays(): Promise<string[] | null> {
  try {
    const res = await axios.get('https://api.myquran.com/v2/cal/list/days');
    if (res.data && res.data.data) {
      return res.data.data;
    }
    return null;
  } catch (err) {
    return null;
  }
}

export async function fetchHijriMonths(): Promise<string[] | null> {
  try {
    const res = await axios.get('https://api.myquran.com/v2/cal/list/months');
    if (res.data && res.data.data) {
      return res.data.data;
    }
    return null;
  } catch (err) {
    return null;
  }
}
