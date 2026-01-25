import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-pages'
import { cors } from 'hono/cors'

// In-memory data store (simulating database)
let bookingsData: any[] = [
  { id: '1', roomId: '1', guestName: 'Arben Hoxha', checkIn: '2026-01-28', checkOut: '2026-01-30', guests: 2, phone: '+355691234567', status: 'confirmed', totalPrice: 80, createdAt: '2026-01-20' },
  { id: '2', roomId: '2', guestName: 'Maria Schmidt', checkIn: '2026-02-01', checkOut: '2026-02-05', guests: 3, phone: '+4915123456789', status: 'confirmed', totalPrice: 200, createdAt: '2026-01-22' },
  { id: '3', roomId: '3', guestName: 'Giovanni Rossi', checkIn: '2026-02-10', checkOut: '2026-02-14', guests: 4, phone: '+393312345678', status: 'pending', totalPrice: 280, createdAt: '2026-01-23' },
]

let roomsData = [
  {
    id: '1',
    name: { al: 'Dhomë Standarde Dyshe', en: 'Standard Double Room', de: 'Standard Doppelzimmer', it: 'Camera Doppia Standard', fr: 'Chambre Double Standard' },
    description: { al: 'Dhomë komode me pamje në male, me krevat dopio dhe banjë private.', en: 'Comfortable room with mountain view, double bed and private bathroom.', de: 'Komfortables Zimmer mit Bergblick, Doppelbett und eigenem Bad.', it: 'Camera confortevole con vista montagna, letto matrimoniale e bagno privato.', fr: 'Chambre confortable avec vue montagne, lit double et salle de bain privée.' },
    pricePerPerson: 40,
    capacity: 2,
    amenities: ['wifi', 'tv', 'heating', 'bathroom', 'mountain-view'],
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
    ]
  },
  {
    id: '2',
    name: { al: 'Dhomë Familjare', en: 'Family Room', de: 'Familienzimmer', it: 'Camera Familiare', fr: 'Chambre Familiale' },
    description: { al: 'Dhomë e gjerë ideale për familje, me dy krevata dhe hapësirë të bollshme.', en: 'Spacious room ideal for families, with two beds and plenty of space.', de: 'Geräumiges Zimmer ideal für Familien, mit zwei Betten und viel Platz.', it: 'Camera spaziosa ideale per famiglie, con due letti e tanto spazio.', fr: 'Chambre spacieuse idéale pour les familles, avec deux lits et beaucoup d\'espace.' },
    pricePerPerson: 35,
    capacity: 4,
    amenities: ['wifi', 'tv', 'heating', 'bathroom', 'balcony', 'mountain-view'],
    images: [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
      'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800',
      'https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=800'
    ]
  },
  {
    id: '3',
    name: { al: 'Suite Deluxe', en: 'Deluxe Suite', de: 'Deluxe Suite', it: 'Suite Deluxe', fr: 'Suite Deluxe' },
    description: { al: 'Suite luksoze me dhomë ndenje të veçantë, balkon panoramik dhe shërbim premium.', en: 'Luxurious suite with separate living area, panoramic balcony and premium service.', de: 'Luxuriöse Suite mit separatem Wohnbereich, Panoramabalkon und Premium-Service.', it: 'Suite lussuosa con zona living separata, balcone panoramico e servizio premium.', fr: 'Suite luxueuse avec coin salon séparé, balcon panoramique et service premium.' },
    pricePerPerson: 60,
    capacity: 2,
    amenities: ['wifi', 'tv', 'heating', 'bathroom', 'balcony', 'mountain-view', 'minibar', 'safe'],
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800'
    ]
  },
  {
    id: '4',
    name: { al: 'Dhomë Ekonomike', en: 'Economy Room', de: 'Economy Zimmer', it: 'Camera Economy', fr: 'Chambre Économique' },
    description: { al: 'Dhomë e thjeshtë dhe e pastër, ideale për udhëtarët me buxhet.', en: 'Simple and clean room, ideal for budget travelers.', de: 'Einfaches und sauberes Zimmer, ideal für preisbewusste Reisende.', it: 'Camera semplice e pulita, ideale per viaggiatori economici.', fr: 'Chambre simple et propre, idéale pour les voyageurs à petit budget.' },
    pricePerPerson: 25,
    capacity: 2,
    amenities: ['wifi', 'heating', 'bathroom'],
    images: [
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800'
    ]
  }
]

let contentData = {
  hero: {
    title: { al: 'Hotel Termal Peshkopi', en: 'Hotel Termal Peshkopi', de: 'Hotel Termal Peshkopi', it: 'Hotel Termal Peshkopi', fr: 'Hôtel Termal Peshkopi' },
    subtitle: { al: 'Relaksim dhe shëndet në zemër të Alpeve Shqiptare', en: 'Relaxation and health in the heart of the Albanian Alps', de: 'Entspannung und Gesundheit im Herzen der albanischen Alpen', it: 'Relax e salute nel cuore delle Alpi albanesi', fr: 'Détente et santé au cœur des Alpes albanaises' },
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920'
  },
  wellness: {
    title: { al: 'Ujërat Termale', en: 'Thermal Waters', de: 'Thermalwasser', it: 'Acque Termali', fr: 'Eaux Thermales' },
    hotBaths: {
      title: { al: 'Llixhat e Ngrohta', en: 'Hot Thermal Baths', de: 'Heiße Thermalbäder', it: 'Bagni Termali Caldi', fr: 'Bains Thermaux Chauds' },
      description: { al: 'Ujërat tona termale të ngrohta natyrore arrijnë temperaturat 38-42°C dhe janë të pasura me minerale si squfur, kalcium dhe magnez. Ideale për trajtimin e reumatizmit, artritit dhe stresit.', en: 'Our natural hot thermal waters reach temperatures of 38-42°C and are rich in minerals such as sulfur, calcium and magnesium. Ideal for treating rheumatism, arthritis and stress.', de: 'Unsere natürlichen heißen Thermalquellen erreichen Temperaturen von 38-42°C und sind reich an Mineralien wie Schwefel, Kalzium und Magnesium. Ideal zur Behandlung von Rheuma, Arthritis und Stress.', it: 'Le nostre acque termali calde naturali raggiungono temperature di 38-42°C e sono ricche di minerali come zolfo, calcio e magnesio. Ideali per il trattamento di reumatismi, artrite e stress.', fr: 'Nos eaux thermales chaudes naturelles atteignent des températures de 38-42°C et sont riches en minéraux tels que le soufre, le calcium et le magnésium. Idéales pour traiter les rhumatismes, l\'arthrite et le stress.' }
    },
    coldBaths: {
      title: { al: 'Llixhat e Ftohta (Ujë Mjekësor)', en: 'Cold Medical Waters', de: 'Kalte Heilwasser', it: 'Acque Medicinali Fredde', fr: 'Eaux Médicinales Froides' },
      description: { al: 'Ujërat e ftohta mjekësore të Peshkopisë janë të njohura për vetitë e tyre kurative. Përdoren për trajtimin e sëmundjeve të lëkurës, problemeve të tretjes dhe përmirësimin e qarkullimit të gjakut.', en: 'The cold medical waters of Peshkopi are known for their curative properties. Used for treating skin diseases, digestive problems and improving blood circulation.', de: 'Die kalten Heilwasser von Peshkopi sind für ihre heilenden Eigenschaften bekannt. Verwendet zur Behandlung von Hautkrankheiten, Verdauungsproblemen und zur Verbesserung der Durchblutung.', it: 'Le acque medicinali fredde di Peshkopi sono note per le loro proprietà curative. Utilizzate per il trattamento di malattie della pelle, problemi digestivi e miglioramento della circolazione sanguigna.', fr: 'Les eaux médicinales froides de Peshkopi sont connues pour leurs propriétés curatives. Utilisées pour traiter les maladies de la peau, les problèmes digestifs et améliorer la circulation sanguine.' }
    },
    images: [
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800'
    ]
  },
  physiotherapy: {
    title: { al: 'Fizioterapi', en: 'Physiotherapy', de: 'Physiotherapie', it: 'Fisioterapia', fr: 'Physiothérapie' },
    description: { al: 'Qendra jonë e fizioterapisë ofron trajtime profesionale nga specialistë të kualifikuar.', en: 'Our physiotherapy center offers professional treatments from qualified specialists.', de: 'Unser Physiotherapiezentrum bietet professionelle Behandlungen von qualifizierten Spezialisten.', it: 'Il nostro centro di fisioterapia offre trattamenti professionali da specialisti qualificati.', fr: 'Notre centre de physiothérapie propose des traitements professionnels par des spécialistes qualifiés.' },
    services: [
      { al: 'Masazh terapeutik', en: 'Therapeutic massage', de: 'Therapeutische Massage', it: 'Massaggio terapeutico', fr: 'Massage thérapeutique' },
      { al: 'Hidroterapi', en: 'Hydrotherapy', de: 'Hydrotherapie', it: 'Idroterapia', fr: 'Hydrothérapie' },
      { al: 'Elektroterapi', en: 'Electrotherapy', de: 'Elektrotherapie', it: 'Elettroterapia', fr: 'Électrothérapie' },
      { al: 'Terapi me ultrazë', en: 'Ultrasound therapy', de: 'Ultraschalltherapie', it: 'Terapia ad ultrasuoni', fr: 'Thérapie par ultrasons' },
      { al: 'Rehabilitim post-operativ', en: 'Post-operative rehabilitation', de: 'Postoperative Rehabilitation', it: 'Riabilitazione post-operatoria', fr: 'Rééducation post-opératoire' },
      { al: 'Terapi për dhimbjet e shpinës', en: 'Back pain therapy', de: 'Rückenschmerztherapie', it: 'Terapia per il mal di schiena', fr: 'Thérapie pour les douleurs dorsales' }
    ]
  },
  gastronomy: {
    title: { al: 'Kuzhina Tradicionale Dibrane', en: 'Traditional Dibran Cuisine', de: 'Traditionelle Dibran-Küche', it: 'Cucina Tradizionale Dibrana', fr: 'Cuisine Traditionnelle de Dibran' },
    description: { al: 'Shijoni gatimin autentik të rajonit të Dibrës, me produkte lokale të freskëta dhe receta që kalojnë brez pas brezi.', en: 'Enjoy authentic Dibra region cooking, with fresh local products and recipes passed down through generations.', de: 'Genießen Sie authentische Küche aus der Region Dibra, mit frischen lokalen Produkten und Rezepten, die über Generationen weitergegeben wurden.', it: 'Gustate la cucina autentica della regione di Dibra, con prodotti locali freschi e ricette tramandate di generazione in generazione.', fr: 'Savourez la cuisine authentique de la région de Dibra, avec des produits locaux frais et des recettes transmises de génération en génération.' },
    images: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
      'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'
    ]
  }
}

let reviewsData = [
  { id: '1', name: 'Fatmir K.', rating: 5, text: { al: 'Shumë mikpritës, dhoma të pastra, ujë termal i mrekullueshëm!', en: 'Very hospitable, clean rooms, amazing thermal water!', de: 'Sehr gastfreundlich, saubere Zimmer, erstaunliches Thermalwasser!', it: 'Molto ospitale, camere pulite, acqua termale fantastica!', fr: 'Très accueillant, chambres propres, eau thermale incroyable!' }, date: '2025-12-15' },
  { id: '2', name: 'Sarah M.', rating: 5, text: { al: 'Eksperiencë e paharrueshme! Stafi ishte shumë i sjellshëm dhe profesional.', en: 'Unforgettable experience! Staff was very kind and professional.', de: 'Unvergessliche Erfahrung! Das Personal war sehr freundlich und professionell.', it: 'Esperienza indimenticabile! Il personale era molto gentile e professionale.', fr: 'Expérience inoubliable! Le personnel était très gentil et professionnel.' }, date: '2025-11-28' },
  { id: '3', name: 'Marco R.', rating: 4, text: { al: 'Vendndodhje e shkëlqyer në mes të natyrës. Ushqimi tradicional ishte i shijshëm.', en: 'Excellent location in the middle of nature. Traditional food was delicious.', de: 'Ausgezeichnete Lage mitten in der Natur. Das traditionelle Essen war köstlich.', it: 'Posizione eccellente in mezzo alla natura. Il cibo tradizionale era delizioso.', fr: 'Excellent emplacement au milieu de la nature. La nourriture traditionnelle était délicieuse.' }, date: '2025-10-20' },
  { id: '4', name: 'Anna H.', rating: 5, text: { al: 'Ujërat termale më ndihmuan shumë me dhimbjet e shpinës. Do të kthehem patjetër!', en: 'Thermal waters helped me a lot with back pain. Will definitely return!', de: 'Das Thermalwasser hat mir sehr bei Rückenschmerzen geholfen. Komme definitiv wieder!', it: 'Le acque termali mi hanno aiutato molto con il mal di schiena. Tornerò sicuramente!', fr: 'Les eaux thermales m\'ont beaucoup aidé avec mes douleurs dorsales. Je reviendrai certainement!' }, date: '2025-09-05' },
  { id: '5', name: 'Besnik L.', rating: 5, text: { al: 'Hotel fantastik me pamje të bukura malore. Rekomanoj për të gjithë!', en: 'Fantastic hotel with beautiful mountain views. I recommend it to everyone!', de: 'Fantastisches Hotel mit wunderschöner Bergaussicht. Ich empfehle es jedem!', it: 'Hotel fantastico con splendida vista sulle montagne. Lo consiglio a tutti!', fr: 'Hôtel fantastique avec de belles vues sur les montagnes. Je le recommande à tous!' }, date: '2025-08-18' }
]

// Admin credentials
const ADMIN_USER = 'admin'
const ADMIN_PASS = 'peshkopi2026'

// Session store (in production, use KV or D1)
let sessions: { [key: string]: { user: string; expires: number } } = {}

const app = new Hono()

// Enable CORS
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic())

// ============== API ROUTES ==============

// Check availability
app.post('/api/check-availability', async (c) => {
  const { checkIn, checkOut, guests } = await c.req.json()
  
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  
  // Find available rooms
  const availableRooms = roomsData.filter(room => {
    if (room.capacity < guests) return false
    
    // Check if room is booked during requested dates
    const isBooked = bookingsData.some(booking => {
      if (booking.roomId !== room.id || booking.status === 'cancelled') return false
      const bookingStart = new Date(booking.checkIn)
      const bookingEnd = new Date(booking.checkOut)
      return (checkInDate < bookingEnd && checkOutDate > bookingStart)
    })
    
    return !isBooked
  })
  
  return c.json({ available: availableRooms.length > 0, rooms: availableRooms, count: availableRooms.length })
})

// Get all rooms
app.get('/api/rooms', (c) => {
  return c.json(roomsData)
})

// Get single room
app.get('/api/rooms/:id', (c) => {
  const room = roomsData.find(r => r.id === c.req.param('id'))
  if (!room) return c.json({ error: 'Room not found' }, 404)
  return c.json(room)
})

// Update room (admin)
app.put('/api/rooms/:id', async (c) => {
  const id = c.req.param('id')
  const updates = await c.req.json()
  const index = roomsData.findIndex(r => r.id === id)
  if (index === -1) return c.json({ error: 'Room not found' }, 404)
  roomsData[index] = { ...roomsData[index], ...updates }
  return c.json(roomsData[index])
})

// Get content
app.get('/api/content', (c) => {
  return c.json(contentData)
})

// Update content (admin)
app.put('/api/content', async (c) => {
  const updates = await c.req.json()
  contentData = { ...contentData, ...updates }
  return c.json(contentData)
})

// Get reviews
app.get('/api/reviews', (c) => {
  return c.json(reviewsData)
})

// Add review (admin)
app.post('/api/reviews', async (c) => {
  const review = await c.req.json()
  review.id = Date.now().toString()
  reviewsData.push(review)
  return c.json(review)
})

// Update review
app.put('/api/reviews/:id', async (c) => {
  const id = c.req.param('id')
  const updates = await c.req.json()
  const index = reviewsData.findIndex(r => r.id === id)
  if (index === -1) return c.json({ error: 'Review not found' }, 404)
  reviewsData[index] = { ...reviewsData[index], ...updates }
  return c.json(reviewsData[index])
})

// Delete review
app.delete('/api/reviews/:id', (c) => {
  const id = c.req.param('id')
  reviewsData = reviewsData.filter(r => r.id !== id)
  return c.json({ success: true })
})

// Get bookings (admin)
app.get('/api/bookings', (c) => {
  return c.json(bookingsData)
})

// Create booking
app.post('/api/bookings', async (c) => {
  const booking = await c.req.json()
  booking.id = Date.now().toString()
  booking.createdAt = new Date().toISOString().split('T')[0]
  booking.status = booking.status || 'pending'
  bookingsData.push(booking)
  return c.json(booking)
})

// Update booking
app.put('/api/bookings/:id', async (c) => {
  const id = c.req.param('id')
  const updates = await c.req.json()
  const index = bookingsData.findIndex(b => b.id === id)
  if (index === -1) return c.json({ error: 'Booking not found' }, 404)
  bookingsData[index] = { ...bookingsData[index], ...updates }
  return c.json(bookingsData[index])
})

// Delete booking
app.delete('/api/bookings/:id', (c) => {
  const id = c.req.param('id')
  bookingsData = bookingsData.filter(b => b.id !== id)
  return c.json({ success: true })
})

// Admin login
app.post('/api/admin/login', async (c) => {
  const { username, password } = await c.req.json()
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36)
    sessions[token] = { user: username, expires: Date.now() + 24 * 60 * 60 * 1000 }
    return c.json({ success: true, token })
  }
  return c.json({ success: false, error: 'Invalid credentials' }, 401)
})

// Verify admin session
app.get('/api/admin/verify', (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  if (token && sessions[token] && sessions[token].expires > Date.now()) {
    return c.json({ valid: true })
  }
  return c.json({ valid: false }, 401)
})

// iCal export
app.get('/api/ical', (c) => {
  let ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Hotel Termal Peshkopi//Booking System//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Hotel Termal Peshkopi Bookings
`

  bookingsData.forEach(booking => {
    if (booking.status !== 'cancelled') {
      const room = roomsData.find(r => r.id === booking.roomId)
      const roomName = room ? room.name.en : 'Unknown Room'
      const startDate = booking.checkIn.replace(/-/g, '')
      const endDate = booking.checkOut.replace(/-/g, '')
      
      ical += `BEGIN:VEVENT
UID:${booking.id}@hoteltermal.peshkopi
DTSTART;VALUE=DATE:${startDate}
DTEND;VALUE=DATE:${endDate}
SUMMARY:${booking.guestName} - ${roomName}
DESCRIPTION:Guest: ${booking.guestName}\\nPhone: ${booking.phone}\\nGuests: ${booking.guests}\\nStatus: ${booking.status}
STATUS:CONFIRMED
END:VEVENT
`
    }
  })

  ical += 'END:VCALENDAR'

  return new Response(ical, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="hotel-termal-bookings.ics"'
    }
  })
})

// Dashboard stats
app.get('/api/admin/stats', (c) => {
  const totalRevenue = bookingsData
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
  
  const totalBookings = bookingsData.length
  const confirmedBookings = bookingsData.filter(b => b.status === 'confirmed').length
  const totalRooms = roomsData.length
  
  // Calculate occupancy for current month
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const daysInMonth = monthEnd.getDate()
  
  let occupiedDays = 0
  bookingsData.forEach(b => {
    if (b.status === 'confirmed') {
      const checkIn = new Date(b.checkIn)
      const checkOut = new Date(b.checkOut)
      const start = checkIn > monthStart ? checkIn : monthStart
      const end = checkOut < monthEnd ? checkOut : monthEnd
      if (start < end) {
        occupiedDays += Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      }
    }
  })
  
  const occupancyRate = Math.round((occupiedDays / (daysInMonth * totalRooms)) * 100)
  
  // Monthly revenue for chart (last 6 months)
  const monthlyRevenue = []
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthName = month.toLocaleDateString('en', { month: 'short' })
    const revenue = bookingsData
      .filter(b => {
        const bookingDate = new Date(b.checkIn)
        return b.status === 'confirmed' && 
               bookingDate.getMonth() === month.getMonth() && 
               bookingDate.getFullYear() === month.getFullYear()
      })
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
    monthlyRevenue.push({ month: monthName, revenue })
  }
  
  return c.json({
    totalRevenue,
    totalBookings,
    confirmedBookings,
    occupancyRate,
    websiteClicks: Math.floor(Math.random() * 500) + 1500, // Mock data
    monthlyRevenue
  })
})

// Main HTML page
const getMainHTML = () => `<!DOCTYPE html>
<html lang="sq">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hotel Termal Peshkopi - Relaksim dhe Shëndet</title>
  <meta name="description" content="Hotel Termal Peshkopi - Ujërat termale natyrale në zemër të Alpeve Shqiptare. Relaksim, shëndet dhe mikpritje tradicionale.">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: {
              50: '#f0fdf4',
              100: '#dcfce7',
              200: '#bbf7d0',
              300: '#86efac',
              400: '#4ade80',
              500: '#22c55e',
              600: '#16a34a',
              700: '#15803d',
              800: '#166534',
              900: '#14532d',
            },
            emerald: {
              50: '#ecfdf5',
              100: '#d1fae5',
              200: '#a7f3d0',
              300: '#6ee7b7',
              400: '#34d399',
              500: '#10b981',
              600: '#059669',
              700: '#047857',
              800: '#065f46',
              900: '#064e3b',
            },
            beige: {
              50: '#fdfbf7',
              100: '#f5f0e6',
              200: '#e8dcc8',
              300: '#d4c4a8',
            }
          },
          fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
            serif: ['Merriweather', 'Georgia', 'serif'],
          }
        }
      }
    }
  </script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
  <style>
    html { scroll-behavior: smooth; }
    body { font-family: 'Inter', sans-serif; }
    h1, h2, h3 { font-family: 'Merriweather', serif; }
    .carousel { overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
    .carousel::-webkit-scrollbar { display: none; }
    .carousel-item { scroll-snap-align: start; flex-shrink: 0; }
    .fade-in { animation: fadeIn 0.5s ease-in; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .hero-gradient { background: linear-gradient(135deg, rgba(5, 150, 105, 0.9) 0%, rgba(4, 120, 87, 0.8) 100%); }
    .glass { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); }
  </style>
</head>
<body class="bg-beige-50 text-gray-800">
  <div id="app"></div>
  <script src="/static/app.js"></script>
</body>
</html>`

// Admin HTML page
const getAdminHTML = () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Panel - Hotel Termal Peshkopi</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: {
              50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
              400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d',
              800: '#166534', 900: '#14532d',
            },
            emerald: {
              50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7',
              400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857',
              800: '#065f46', 900: '#064e3b',
            }
          }
        }
      }
    }
  </script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
  </style>
</head>
<body class="bg-gray-100">
  <div id="admin-app"></div>
  <script src="/static/admin.js"></script>
</body>
</html>`

// Login page
const getLoginHTML = () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - Hotel Termal Peshkopi</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            emerald: { 600: '#059669', 700: '#047857', 800: '#065f46' }
          }
        }
      }
    }
  </script>
</head>
<body class="bg-gradient-to-br from-emerald-600 to-emerald-800 min-h-screen flex items-center justify-center p-4">
  <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
    <div class="text-center mb-8">
      <div class="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fas fa-hotel text-3xl text-emerald-600"></i>
      </div>
      <h1 class="text-2xl font-bold text-gray-800">Hotel Termal Peshkopi</h1>
      <p class="text-gray-500">Admin Panel</p>
    </div>
    <form id="loginForm" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
        <input type="text" id="username" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" placeholder="Enter username">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <input type="password" id="password" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" placeholder="Enter password">
      </div>
      <div id="error" class="text-red-500 text-sm hidden"></div>
      <button type="submit" class="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2">
        <i class="fas fa-sign-in-alt"></i> Login
      </button>
    </form>
    <p class="text-center text-gray-500 text-sm mt-6">
      <a href="/" class="text-emerald-600 hover:underline"><i class="fas fa-arrow-left mr-1"></i> Back to Website</a>
    </p>
  </div>
  <script>
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const errorEl = document.getElementById('error');
      
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        
        if (data.success) {
          localStorage.setItem('adminToken', data.token);
          window.location.href = '/admin';
        } else {
          errorEl.textContent = 'Invalid username or password';
          errorEl.classList.remove('hidden');
        }
      } catch (err) {
        errorEl.textContent = 'Connection error. Please try again.';
        errorEl.classList.remove('hidden');
      }
    });
  </script>
</body>
</html>`

// Routes
app.get('/', (c) => {
  return c.html(getMainHTML())
})

app.get('/login', (c) => {
  return c.html(getLoginHTML())
})

app.get('/admin', (c) => {
  return c.html(getAdminHTML())
})

export default app
