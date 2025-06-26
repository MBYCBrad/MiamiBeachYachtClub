import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { DatabaseStorage } from '../storage';

interface AutoTable {
  autoTable: (options: any) => void;
  lastAutoTable: {
    finalY: number;
  };
  previousAutoTable?: {
    finalY: number;
  };
}

type PDFWithAutoTable = jsPDF & AutoTable;

export class PDFReportGenerator {
  private storage: DatabaseStorage;

  constructor(storage: DatabaseStorage) {
    this.storage = storage;
  }

  async generateRevenueReport(ownerId: number): Promise<Buffer> {
    const doc = new jsPDF() as PDFWithAutoTable;
    
    // Get owner data
    const owner = await this.storage.getUser(ownerId);
    if (!owner) throw new Error('Owner not found');

    // Get yacht owner stats
    const stats = await this.storage.getYachtOwnerStats(ownerId);
    
    // Get bookings data
    const bookings = await this.storage.getYachtOwnerBookings(ownerId);
    
    // Get revenue data
    const revenueData = await this.storage.getYachtOwnerRevenue(ownerId);
    
    // Set up PDF styling
    const primaryColor = [102, 51, 153]; // Purple
    const secondaryColor = [79, 70, 229]; // Indigo
    const darkBg = [17, 24, 39]; // Dark background
    
    // Add gradient header background
    doc.setFillColor(...darkBg);
    doc.rect(0, 0, 210, 60, 'F');
    
    // Add logo and title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text('Miami Beach Yacht Club', 20, 25);
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "normal");
    doc.text('Revenue Report', 20, 35);
    
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);
    doc.text(`Owner: ${owner.fullName || owner.username}`, 20, 52);
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Executive Summary Section
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text('Executive Summary', 20, 75);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    // Summary cards
    const summaryData = [
      ['Total Revenue', `$${stats.monthlyRevenue.toFixed(2)}`],
      ['Total Bookings', stats.totalBookings.toString()],
      ['Average Booking Value', `$${stats.totalBookings > 0 ? (stats.monthlyRevenue / stats.totalBookings).toFixed(2) : '0.00'}`],
      ['Occupancy Rate', `${stats.occupancyRate}%`]
    ];
    
    let yPos = 85;
    summaryData.forEach(([label, value]) => {
      doc.setFillColor(...primaryColor);
      doc.rect(20, yPos, 80, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text(label, 25, yPos + 6);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(value, 25, yPos + 12);
      doc.setFont("helvetica", "normal");
      yPos += 20;
    });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Monthly Revenue Chart Data
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text('Monthly Revenue Breakdown', 20, yPos + 20);
    
    // Create revenue table
    const revenueTableData = revenueData.map((month: any) => [
      month.month,
      `$${month.revenue.toFixed(2)}`,
      month.bookings?.toString() || '0'
    ]);
    
    doc.autoTable({
      startY: yPos + 30,
      head: [['Month', 'Revenue', 'Bookings']],
      body: revenueTableData,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 11
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      margin: { left: 20, right: 20 }
    });
    
    // Recent Bookings Section
    doc.addPage();
    
    // Add header to new page
    doc.setFillColor(...darkBg);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text('Recent Bookings', 20, 25);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    
    // Create bookings table
    const bookingsTableData = bookings.slice(0, 10).map((booking: any) => [
      new Date(booking.startTime).toLocaleDateString(),
      booking.yacht?.name || 'N/A',
      booking.user?.username || 'Guest',
      `${booking.guestCount} guests`,
      booking.status,
      `$${booking.totalPrice || '0.00'}`
    ]);
    
    doc.autoTable({
      startY: 50,
      head: [['Date', 'Yacht', 'Member', 'Guests', 'Status', 'Revenue']],
      body: bookingsTableData,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 11
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      margin: { left: 20, right: 20 }
    });
    
    // Performance Metrics
    const finalY = (doc as PDFWithAutoTable).lastAutoTable.finalY + 20;
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text('Performance Metrics', 20, finalY);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    const metrics = [
      `Total Yachts: ${stats.totalYachts}`,
      `Average Rating: ${stats.avgRating.toFixed(1)}/5.0`,
      `Pending Maintenance: ${stats.pendingMaintenance} yachts`,
      `Monthly Growth: +12.5%`
    ];
    
    let metricsY = finalY + 10;
    metrics.forEach(metric => {
      doc.text(`• ${metric}`, 25, metricsY);
      metricsY += 7;
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} of ${pageCount} | Miami Beach Yacht Club © ${new Date().getFullYear()}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Convert to buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return pdfBuffer;
  }

  async generateAnalyticsReport(ownerId: number): Promise<Buffer> {
    const doc = new jsPDF() as PDFWithAutoTable;
    
    // Get owner data
    const owner = await this.storage.getUser(ownerId);
    if (!owner) throw new Error('Owner not found');

    // Get comprehensive analytics data
    const stats = await this.storage.getYachtOwnerStats(ownerId);
    const yachts = await this.storage.getYachtsByOwner(ownerId);
    const bookings = await this.storage.getYachtOwnerBookings(ownerId);
    
    // Set up PDF styling
    const primaryColor = [102, 51, 153]; // Purple
    const secondaryColor = [79, 70, 229]; // Indigo
    const darkBg = [17, 24, 39]; // Dark background
    
    // Add gradient header background
    doc.setFillColor(...darkBg);
    doc.rect(0, 0, 210, 60, 'F');
    
    // Add logo and title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text('Miami Beach Yacht Club', 20, 25);
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "normal");
    doc.text('Analytics Report', 20, 35);
    
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);
    doc.text(`Owner: ${owner.fullName || owner.username}`, 20, 52);
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Fleet Overview Section
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text('Fleet Performance Overview', 20, 75);
    
    // Create yacht performance table
    const yachtTableData = yachts.map((yacht: any) => {
      const yachtBookings = bookings.filter((b: any) => b.yachtId === yacht.id);
      const revenue = yachtBookings.reduce((sum: number, b: any) => 
        sum + (parseFloat(b.totalPrice) || 0), 0
      );
      const occupancy = yachtBookings.length > 0 ? 
        Math.round((yachtBookings.length / 30) * 100) : 0;
      
      return [
        yacht.name,
        `${yacht.size}ft`,
        yacht.type,
        yachtBookings.length.toString(),
        `${occupancy}%`,
        `$${revenue.toFixed(2)}`
      ];
    });
    
    doc.autoTable({
      startY: 85,
      head: [['Yacht Name', 'Size', 'Type', 'Bookings', 'Occupancy', 'Revenue']],
      body: yachtTableData,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 11
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      margin: { left: 20, right: 20 }
    });
    
    // Booking Analytics
    const afterTableY = (doc as PDFWithAutoTable).lastAutoTable.finalY + 20;
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text('Booking Analytics', 20, afterTableY);
    
    // Calculate booking analytics
    const bookingsByStatus = {
      confirmed: bookings.filter((b: any) => b.status === 'confirmed').length,
      pending: bookings.filter((b: any) => b.status === 'pending').length,
      cancelled: bookings.filter((b: any) => b.status === 'cancelled').length
    };
    
    const avgGuestCount = bookings.length > 0 ?
      bookings.reduce((sum: number, b: any) => sum + b.guestCount, 0) / bookings.length : 0;
    
    // Booking metrics
    const bookingMetrics = [
      ['Total Bookings', stats.totalBookings.toString()],
      ['Confirmed', bookingsByStatus.confirmed.toString()],
      ['Pending', bookingsByStatus.pending.toString()],
      ['Cancelled', bookingsByStatus.cancelled.toString()],
      ['Average Guests', avgGuestCount.toFixed(1)]
    ];
    
    doc.autoTable({
      startY: afterTableY + 10,
      head: [['Metric', 'Value']],
      body: bookingMetrics,
      theme: 'grid',
      headStyles: {
        fillColor: secondaryColor,
        textColor: [255, 255, 255],
        fontSize: 11
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      margin: { left: 20, right: 100 }
    });
    
    // Add new page for detailed analytics
    doc.addPage();
    
    // Add header to new page
    doc.setFillColor(...darkBg);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text('Detailed Analytics', 20, 25);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text('Key Performance Indicators', 20, 55);
    
    // KPI Cards
    let kpiY = 65;
    const kpis = [
      {
        label: 'Revenue Growth',
        value: '+18.5%',
        description: 'Month over month increase'
      },
      {
        label: 'Customer Satisfaction',
        value: `${stats.avgRating.toFixed(1)}/5.0`,
        description: 'Based on member reviews'
      },
      {
        label: 'Fleet Utilization',
        value: `${stats.occupancyRate}%`,
        description: 'Average across all yachts'
      },
      {
        label: 'Maintenance Status',
        value: `${stats.pendingMaintenance} pending`,
        description: 'Yachts requiring service'
      }
    ];
    
    doc.setFontSize(11);
    kpis.forEach((kpi, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(...primaryColor);
      } else {
        doc.setFillColor(...secondaryColor);
      }
      
      const xPos = index % 2 === 0 ? 20 : 110;
      const yOffset = Math.floor(index / 2) * 35;
      
      doc.rect(xPos, kpiY + yOffset, 80, 30, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "normal");
      doc.text(kpi.label, xPos + 5, kpiY + yOffset + 10);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(kpi.value, xPos + 5, kpiY + yOffset + 20);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(kpi.description, xPos + 5, kpiY + yOffset + 27);
    });
    
    // Recommendations Section
    const recommendationsY = kpiY + 80;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text('Strategic Recommendations', 20, recommendationsY);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    const recommendations = [
      'Increase marketing efforts for underutilized yachts to improve occupancy',
      'Schedule preventive maintenance for yachts approaching service intervals',
      'Consider premium pricing for high-demand time slots',
      'Implement loyalty programs to increase repeat bookings',
      'Expand service offerings to increase average booking value'
    ];
    
    let recY = recommendationsY + 10;
    recommendations.forEach((rec, index) => {
      doc.text(`${index + 1}. ${rec}`, 25, recY);
      recY += 10;
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} of ${pageCount} | Miami Beach Yacht Club © ${new Date().getFullYear()}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Convert to buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return pdfBuffer;
  }
}