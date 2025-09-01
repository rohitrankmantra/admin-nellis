// Mock data for the admin panel
export const mockStats = {
  totalCars: 156,
  totalDealers: 12,
  serviceBookings: 24,
  blogPosts: 18,
  monthlyInquiries: 89,
  weeklySpecials: 8
};

export const mockInventory = [
  {
    id: 1,
    brand: 'Toyota',
    model: 'Camry',
    year: 2021,
    mileage: 25000,
    price: 24999,
    dealer: 'Nellis Toyota',
    images: ['https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg'],
    condition: 'Excellent',
    transmission: 'Automatic',
    fuelType: 'Gasoline'
  },
  {
    id: 2,
    brand: 'Honda',
    model: 'Civic',
    year: 2020,
    mileage: 32000,
    price: 19999,
    dealer: 'Henderson Honda',
    images: ['https://images.pexels.com/photos/1149137/pexels-photo-1149137.jpeg'],
    condition: 'Good',
    transmission: 'Manual',
    fuelType: 'Gasoline'
  },
  {
    id: 3,
    brand: 'Ford',
    model: 'F-150',
    year: 2022,
    mileage: 15000,
    price: 35999,
    dealer: 'Desert Ford',
    images: ['https://images.pexels.com/photos/1468838/pexels-photo-1468838.jpeg'],
    condition: 'Excellent',
    transmission: 'Automatic',
    fuelType: 'Gasoline'
  }
];

export const mockDealerships = [
  {
    id: 1,
    name: 'Nellis Toyota',
    logo: 'https://images.pexels.com/photos/2883049/pexels-photo-2883049.jpeg',
    address: '1234 Nellis Blvd, Las Vegas, NV 89156',
    phone: '(702) 555-0123',
    email: 'info@nellistoyota.com',
    website: 'https://nellistoyota.com',
    services: ['New Cars', 'Used Cars', 'Service', 'Parts'],
    hours: 'Mon-Sat: 9AM-9PM, Sun: 10AM-7PM',
    mapUrl: 'https://maps.google.com'
  },
  {
    id: 2,
    name: 'Henderson Honda',
    logo: 'https://images.pexels.com/photos/2883049/pexels-photo-2883049.jpeg',
    address: '5678 Nellis Blvd, Las Vegas, NV 89156',
    phone: '(702) 555-0456',
    email: 'contact@hendersonhonda.com',
    website: 'https://hendersonhonda.com',
    services: ['New Cars', 'Used Cars', 'Service', 'Parts', 'Financing'],
    hours: 'Mon-Sat: 8AM-8PM, Sun: 10AM-6PM',
    mapUrl: 'https://maps.google.com'
  }
];

export const mockWeeklySpecials = [
  {
    id: 1,
    title: 'Summer Sale Event',
    dealership: 'Nellis Toyota',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    date: '2024-01-15',
    description: 'Special financing offers on all new Toyota vehicles'
  },
  {
    id: 2,
    title: 'Honda Service Special',
    dealership: 'Henderson Honda',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    date: '2024-01-10',
    description: 'Oil change and tire rotation special'
  }
];

export const mockOffers = [
  {
    id: 1,
    title: '$5000 Cash Back',
    description: 'Get up to $5000 cash back on select new vehicles',
    dealership: 'Nellis Toyota',
    banner: 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg',
    validUntil: '2024-02-28',
    terms: 'Qualified buyers only. See dealer for details.'
  },
  {
    id: 2,
    title: 'Free Oil Changes',
    description: 'Free oil changes for the first year with any service plan',
    dealership: 'Henderson Honda',
    banner: 'https://images.pexels.com/photos/4479142/pexels-photo-4479142.jpeg',
    validUntil: '2024-03-15',
    terms: 'New customers only. Up to 4 oil changes.'
  }
];

export const mockBusinesses = [
  {
    id: 1,
    name: 'Quick Wash Car Wash',
    type: 'Car Wash',
    address: '999 Nellis Blvd, Las Vegas, NV 89156',
    phone: '(702) 555-0789',
    email: 'info@quickwash.com',
    website: 'https://quickwash.com',
    hours: 'Daily: 7AM-10PM',
    services: ['Exterior Wash', 'Interior Cleaning', 'Wax Service']
  },
  {
    id: 2,
    name: 'AutoZone Parts',
    type: 'Parts Store',
    address: '1111 Nellis Blvd, Las Vegas, NV 89156',
    phone: '(702) 555-0321',
    email: 'nellis@autozone.com',
    website: 'https://autozone.com',
    hours: 'Mon-Sat: 8AM-10PM, Sun: 9AM-9PM',
    services: ['Auto Parts', 'Battery Installation', 'Oil', 'Accessories']
  }
];

export const mockServiceBookings = [
  {
    id: 1,
    customerName: 'John Smith',
    email: 'john@email.com',
    phone: '(702) 555-1234',
    service: 'Oil Change',
    vehicle: '2020 Toyota Camry',
    preferredDate: '2024-01-20',
    status: 'Pending',
    notes: 'Customer prefers morning appointment'
  },
  {
    id: 2,
    customerName: 'Jane Doe',
    email: 'jane@email.com',
    phone: '(702) 555-5678',
    service: 'Brake Inspection',
    vehicle: '2019 Honda Civic',
    preferredDate: '2024-01-22',
    status: 'Confirmed',
    notes: 'Hearing squeaking noise'
  }
];

export const mockBlogPosts = [
  {
    id: 1,
    title: 'Top 5 Used Cars Under $20,000',
    content: 'Looking for a reliable used car without breaking the bank? Here are our top picks...',
    author: 'Admin',
    publishDate: '2024-01-15',
    tags: ['Used Cars', 'Budget', 'Tips'],
    status: 'Published',
    image: 'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg'
  },
  {
    id: 2,
    title: '2024 Car Maintenance Tips',
    content: 'Keep your vehicle running smoothly with these essential maintenance tips...',
    author: 'Admin',
    publishDate: '2024-01-10',
    tags: ['Maintenance', 'Tips', 'Care'],
    status: 'Published',
    image: 'https://images.pexels.com/photos/4480474/pexels-photo-4480474.jpeg'
  }
];

export const mockContactSubmissions = [
  {
    id: 1,
    name: 'Mike Johnson',
    email: 'mike@email.com',
    phone: '(702) 555-9876',
    subject: 'Interested in 2021 Toyota Camry',
    message: 'I saw the car listed on your website and would like more information.',
    submittedAt: '2024-01-18T10:30:00Z',
    status: 'New'
  },
  {
    id: 2,
    name: 'Sarah Wilson',
    email: 'sarah@email.com',
    phone: '(702) 555-4321',
    subject: 'Service Appointment',
    message: 'I need to schedule a service appointment for my Honda.',
    submittedAt: '2024-01-17T14:15:00Z',
    status: 'Responded'
  }
];