// src/utils/hijriFallback.ts
// Algoritma konversi sederhana Gregorian ke Hijriah (Ummul Qura approx)
// Referensi: https://webspace.science.uu.nl/~gent0113/islam/addfiles/islamtab.htm

export function gregorianToHijri(date: Date): {date: number, month: string, year: number} {
    // Nama bulan Hijriah
    const hijriMonths = [
        'Muharram', 'Safar', 'Rabiul Awal', 'Rabiul Akhir',
        'Jumadil Awal', 'Jumadil Akhir', 'Rajab', 'Syaban',
        'Ramadhan', 'Syawal', 'Dzulkaidah', 'Dzulhijjah'
    ];

    // Rumus konversi (sederhana, cukup akurat untuk aplikasi umum)
    let day = date.getDate();
    let month = date.getMonth() + 1; // Januari = 1
    let year = date.getFullYear();

    let jd = Math.floor((1461 * (year + 4800 + Math.floor((month - 14) / 12))) / 4)
        + Math.floor((367 * (month - 2 - 12 * (Math.floor((month - 14) / 12)))) / 12)
        - Math.floor((3 * Math.floor((year + 4900 + Math.floor((month - 14) / 12)) / 100)) / 4)
        + day - 32075;

    let l = jd - 1948440 + 10632;
    let n = Math.floor((l - 1) / 10631);
    l = l - 10631 * n + 354;
    let j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719))
        + (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238));
    l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50))
        - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
    let hijriMonth = Math.floor((24 * l) / 709);
    let hijriDay = l - Math.floor((709 * hijriMonth) / 24);
    let hijriYear = 30 * n + j - 30;

    return {
        date: hijriDay,
        month: hijriMonths[hijriMonth - 1],
        year: hijriYear
    };
}
