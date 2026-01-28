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

// ============== BLOG DATA ==============
let postsData: any[] = [
  {
    id: '1',
    title: { al: 'Përfitimet Shëndetësore të Ujërave Termale', en: 'Health Benefits of Thermal Waters', de: 'Gesundheitsvorteile von Thermalwasser', it: 'Benefici per la salute delle acque termali', fr: 'Bienfaits des eaux thermales pour la santé' },
    slug: 'perfitimet-shendetesore-ujerat-termale',
    excerpt: { al: 'Zbuloni se si ujërat termale të Peshkopisë mund të përmirësojnë shëndetin tuaj.', en: 'Discover how Peshkopi thermal waters can improve your health.', de: 'Entdecken Sie, wie Peshkopi-Thermalwasser Ihre Gesundheit verbessern kann.', it: 'Scopri come le acque termali di Peshkopi possono migliorare la tua salute.', fr: 'Découvrez comment les eaux thermales de Peshkopi peuvent améliorer votre santé.' },
    content: { al: '<p>Ujërat termale të Peshkopisë kanë qenë të njohura për shekuj për vetitë e tyre kurative. Të pasura me minerale si squfur, kalcium dhe magnez, këto ujëra ndihmojnë në trajtimin e:</p><ul><li>Reumatizmit dhe artritit</li><li>Problemeve të lëkurës</li><li>Stresit dhe ankthit</li><li>Dhimbjeve muskulore</li></ul><p>Vizitoni Hotel Termal Peshkopi për të përjetuar këto përfitime vetë!</p>', en: '<p>The thermal waters of Peshkopi have been known for centuries for their curative properties. Rich in minerals such as sulfur, calcium and magnesium, these waters help treat:</p><ul><li>Rheumatism and arthritis</li><li>Skin problems</li><li>Stress and anxiety</li><li>Muscle pain</li></ul><p>Visit Hotel Termal Peshkopi to experience these benefits yourself!</p>', de: '<p>Die Thermalquellen von Peshkopi sind seit Jahrhunderten für ihre heilenden Eigenschaften bekannt.</p>', it: '<p>Le acque termali di Peshkopi sono note da secoli per le loro proprietà curative.</p>', fr: '<p>Les eaux thermales de Peshkopi sont connues depuis des siècles pour leurs propriétés curatives.</p>' },
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
    date: '2026-01-15'
  },
  {
    id: '2',
    title: { al: 'Kuzhina Tradicionale Dibrane - Një Udhëtim Gastronomik', en: 'Traditional Dibran Cuisine - A Gastronomic Journey', de: 'Traditionelle Dibran-Küche - Eine gastronomische Reise', it: 'Cucina tradizionale Dibrana - Un viaggio gastronomico', fr: 'Cuisine traditionnelle de Dibran - Un voyage gastronomique' },
    slug: 'kuzhina-tradicionale-dibrane',
    excerpt: { al: 'Eksploroni shijet autentike të rajonit të Dibrës në restorantin tonë.', en: 'Explore the authentic flavors of the Dibra region in our restaurant.', de: 'Entdecken Sie die authentischen Aromen der Region Dibra in unserem Restaurant.', it: 'Esplora i sapori autentici della regione di Dibra nel nostro ristorante.', fr: 'Explorez les saveurs authentiques de la région de Dibra dans notre restaurant.' },
    content: { al: '<p>Kuzhina dibrane është një thesar i traditës shqiptare. Në Hotel Termal Peshkopi, ne ofrojmë pjata të përgatitura me produkte lokale të freskëta.</p><h3>Pjatat tona të veçanta:</h3><ul><li>Flija - ëmbëlsira tradicionale me shumë shtresa</li><li>Tavë kosi - mish qengji me kos</li><li>Byrek me spinaq dhe djathë</li></ul>', en: '<p>Dibran cuisine is a treasure of Albanian tradition. At Hotel Termal Peshkopi, we offer dishes prepared with fresh local products.</p>', de: '<p>Die Dibran-Küche ist ein Schatz der albanischen Tradition.</p>', it: '<p>La cucina Dibrana è un tesoro della tradizione albanese.</p>', fr: '<p>La cuisine de Dibran est un trésor de la tradition albanaise.</p>' },
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    date: '2026-01-10'
  },
  {
    id: '3',
    title: { al: 'Sezoni i Dimrit në Peshkopi - Aktivitete dhe Relaksim', en: 'Winter Season in Peshkopi - Activities and Relaxation', de: 'Wintersaison in Peshkopi - Aktivitäten und Entspannung', it: 'Stagione invernale a Peshkopi - Attività e relax', fr: 'Saison d\'hiver à Peshkopi - Activités et détente' },
    slug: 'sezoni-dimrit-peshkopi',
    excerpt: { al: 'Pse dimri është koha perfekte për të vizituar ujërat termale.', en: 'Why winter is the perfect time to visit thermal waters.', de: 'Warum der Winter die perfekte Zeit ist, um Thermalwasser zu besuchen.', it: 'Perché l\'inverno è il momento perfetto per visitare le acque termali.', fr: 'Pourquoi l\'hiver est le moment idéal pour visiter les eaux thermales.' },
    content: { al: '<p>Dimri në Peshkopi ofron një eksperiencë unike. Imagjinoni të zhyteni në ujëra të ngrohta termale ndërsa dëbora bie përreth!</p><p>Përveç ujërave termale, mund të shijoni:</p><ul><li>Ski në malin e Korabit</li><li>Ecje në natyrë</li><li>Fotografi të bukura peizazhi</li></ul>', en: '<p>Winter in Peshkopi offers a unique experience. Imagine diving into warm thermal waters while snow falls around you!</p>', de: '<p>Der Winter in Peshkopi bietet ein einzigartiges Erlebnis.</p>', it: '<p>L\'inverno a Peshkopi offre un\'esperienza unica.</p>', fr: '<p>L\'hiver à Peshkopi offre une expérience unique.</p>' },
    image: '',
    date: '2026-01-05'
  }
]

// ============== FINANCE DATA ==============
let financeData: any[] = [
  { id: '1', date: '2026-01-05', amount: 150, category: 'Fatura (Drita/Ujë/Internet)', description: 'Fatura e dritave - Janar' },
  { id: '2', date: '2026-01-10', amount: 500, category: 'Furnizim (Ushqime/Pije)', description: 'Furnizim javore ushqimore' },
  { id: '3', date: '2026-01-15', amount: 1200, category: 'Rroga Punëtorësh', description: 'Paga - Recepsionist' },
  { id: '4', date: '2026-01-15', amount: 1000, category: 'Rroga Punëtorësh', description: 'Paga - Pastrues' },
  { id: '5', date: '2026-01-20', amount: 200, category: 'Materiale', description: 'Produkte pastrimi' },
  { id: '6', date: '2026-01-25', amount: 350, category: 'Pagesë Llixha (Taksa)', description: 'Taksë mujore llixhash' },
  { id: '7', date: '2025-12-05', amount: 180, category: 'Fatura (Drita/Ujë/Internet)', description: 'Fatura e dritave - Dhjetor' },
  { id: '8', date: '2025-12-10', amount: 450, category: 'Furnizim (Ushqime/Pije)', description: 'Furnizim javore' },
  { id: '9', date: '2025-12-15', amount: 2200, category: 'Rroga Punëtorësh', description: 'Paga stafi' },
  { id: '10', date: '2025-11-20', amount: 800, category: 'Pagesë Mirëmbajtje', description: 'Riparim sistemi ngrohje' },
  { id: '11', date: '2025-11-10', amount: 250, category: 'Siguracione', description: 'Sigurim mujor' },
  { id: '12', date: '2025-10-15', amount: 100, category: 'Shpenzime Online', description: 'Reklamë Facebook' }
]

// Expense categories
const expenseCategories = [
  'Shpenzime Online',
  'Siguracione', 
  'Fatura (Drita/Ujë/Internet)',
  'Furnizim (Ushqime/Pije)',
  'Rroga Punëtorësh',
  'Materiale',
  'Pagesë Mirëmbajtje',
  'Pagesë Llixha (Taksa)',
  'Shpenzime Personale',
  'Shpenzime Shtetërore'
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

// ============== BLOG API ROUTES ==============

// Get all posts
app.get('/api/posts', (c) => {
  return c.json(postsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
})

// Get single post by slug
app.get('/api/posts/:slug', (c) => {
  const slug = c.req.param('slug')
  const post = postsData.find(p => p.slug === slug || p.id === slug)
  if (!post) return c.json({ error: 'Post not found' }, 404)
  return c.json(post)
})

// Create post (admin)
app.post('/api/posts', async (c) => {
  const post = await c.req.json()
  post.id = Date.now().toString()
  post.date = post.date || new Date().toISOString().split('T')[0]
  // Generate slug from Albanian title if not provided
  if (!post.slug && post.title?.al) {
    post.slug = post.title.al.toLowerCase()
      .replace(/[ëê]/g, 'e').replace(/[ç]/g, 'c').replace(/[ë]/g, 'e')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }
  postsData.push(post)
  return c.json(post)
})

// Update post (admin)
app.put('/api/posts/:id', async (c) => {
  const id = c.req.param('id')
  const updates = await c.req.json()
  const index = postsData.findIndex(p => p.id === id)
  if (index === -1) return c.json({ error: 'Post not found' }, 404)
  postsData[index] = { ...postsData[index], ...updates }
  return c.json(postsData[index])
})

// Delete post (admin)
app.delete('/api/posts/:id', (c) => {
  const id = c.req.param('id')
  postsData = postsData.filter(p => p.id !== id)
  return c.json({ success: true })
})

// ============== FINANCE API ROUTES ==============

// Get expense categories
app.get('/api/finance/categories', (c) => {
  return c.json(expenseCategories)
})

// Get all finance records
app.get('/api/finance', (c) => {
  const year = c.req.query('year')
  let data = financeData
  if (year) {
    data = financeData.filter(f => f.date.startsWith(year))
  }
  return c.json(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
})

// Create finance record (admin)
app.post('/api/finance', async (c) => {
  const record = await c.req.json()
  record.id = Date.now().toString()
  record.amount = parseFloat(record.amount)
  financeData.push(record)
  return c.json(record)
})

// Update finance record (admin)
app.put('/api/finance/:id', async (c) => {
  const id = c.req.param('id')
  const updates = await c.req.json()
  const index = financeData.findIndex(f => f.id === id)
  if (index === -1) return c.json({ error: 'Record not found' }, 404)
  updates.amount = parseFloat(updates.amount)
  financeData[index] = { ...financeData[index], ...updates }
  return c.json(financeData[index])
})

// Delete finance record (admin)
app.delete('/api/finance/:id', (c) => {
  const id = c.req.param('id')
  financeData = financeData.filter(f => f.id !== id)
  return c.json({ success: true })
})

// Finance stats (admin)
app.get('/api/finance/stats', (c) => {
  const year = c.req.query('year') || new Date().getFullYear().toString()
  
  // Calculate revenue from bookings for the year
  const yearBookings = bookingsData.filter(b => 
    b.status === 'confirmed' && b.checkIn.startsWith(year)
  )
  const totalRevenue = yearBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)
  
  // Calculate expenses for the year
  const yearExpenses = financeData.filter(f => f.date.startsWith(year))
  const totalExpenses = yearExpenses.reduce((sum, f) => sum + f.amount, 0)
  
  // Net profit
  const netProfit = totalRevenue - totalExpenses
  
  // Expenses by category
  const expensesByCategory: { [key: string]: number } = {}
  yearExpenses.forEach(f => {
    expensesByCategory[f.category] = (expensesByCategory[f.category] || 0) + f.amount
  })
  
  // Monthly profit/loss
  const monthlyData: { [key: string]: { revenue: number; expenses: number } } = {}
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  months.forEach((month, i) => {
    const monthNum = String(i + 1).padStart(2, '0')
    const monthPrefix = `${year}-${monthNum}`
    
    const monthRevenue = bookingsData
      .filter(b => b.status === 'confirmed' && b.checkIn.startsWith(monthPrefix))
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
    
    const monthExpenses = financeData
      .filter(f => f.date.startsWith(monthPrefix))
      .reduce((sum, f) => sum + f.amount, 0)
    
    monthlyData[month] = { revenue: monthRevenue, expenses: monthExpenses }
  })
  
  return c.json({
    year,
    totalRevenue,
    totalExpenses,
    netProfit,
    expensesByCategory,
    monthlyData
  })
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
    .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
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

// Blog post page HTML
const getBlogPostHTML = (post: any) => `<!DOCTYPE html>
<html lang="sq">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title?.al || 'Blog'} - Hotel Termal Peshkopi</title>
  <meta name="description" content="${post.excerpt?.al || ''}">
  <meta property="og:title" content="${post.title?.al || 'Blog'}">
  <meta property="og:description" content="${post.excerpt?.al || ''}">
  ${post.image ? `<meta property="og:image" content="${post.image}">` : ''}
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            emerald: { 50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b' },
            beige: { 50: '#fdfbf7', 100: '#f5f0e6' }
          },
          fontFamily: { sans: ['Inter', 'sans-serif'], serif: ['Merriweather', 'serif'] }
        }
      }
    }
  </script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    h1, h2, h3 { font-family: 'Merriweather', serif; }
    .prose h3 { font-size: 1.25rem; font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.5rem; }
    .prose ul { list-style-type: disc; padding-left: 1.5rem; margin: 1rem 0; }
    .prose li { margin: 0.5rem 0; }
    .prose p { margin: 1rem 0; line-height: 1.8; }
  </style>
</head>
<body class="bg-beige-50 text-gray-800">
  <!-- Navigation -->
  <nav class="bg-white shadow-sm sticky top-0 z-50">
    <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
      <a href="/" class="flex items-center gap-2 text-emerald-700 hover:text-emerald-800">
        <i class="fas fa-arrow-left"></i>
        <span class="font-medium">Kthehu në Kryefaqje</span>
      </a>
      <a href="/" class="flex items-center gap-2">
        <div class="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
          <i class="fas fa-spa text-white"></i>
        </div>
        <span class="font-serif font-bold text-emerald-800 hidden md:block">Hotel Termal</span>
      </a>
    </div>
  </nav>

  <article class="max-w-4xl mx-auto px-4 py-12">
    ${post.image ? `
      <img src="${post.image}" alt="${post.title?.al}" class="w-full h-64 md:h-96 object-cover rounded-2xl mb-8 shadow-lg">
    ` : ''}
    
    <div class="mb-6">
      <span class="text-emerald-600 text-sm font-medium">
        <i class="far fa-calendar-alt mr-1"></i>
        ${new Date(post.date).toLocaleDateString('sq-AL', { year: 'numeric', month: 'long', day: 'numeric' })}
      </span>
    </div>
    
    <h1 class="text-3xl md:text-4xl font-serif font-bold text-emerald-800 mb-6">${post.title?.al || ''}</h1>
    
    <div class="prose text-gray-700 text-lg leading-relaxed">
      ${post.content?.al || ''}
    </div>
    
    <div class="mt-12 pt-8 border-t border-gray-200">
      <h3 class="font-serif font-bold text-emerald-800 mb-4">Na kontaktoni për më shumë informacion</h3>
      <div class="flex flex-wrap gap-4">
        <a href="https://wa.me/355684340580" target="_blank" class="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition">
          <i class="fab fa-whatsapp text-xl"></i>
          WhatsApp
        </a>
        <a href="tel:+355684340580" class="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition">
          <i class="fas fa-phone"></i>
          +355 68 434 0580
        </a>
      </div>
    </div>
  </article>

  <!-- Footer -->
  <footer class="bg-emerald-900 text-white py-8 mt-12">
    <div class="max-w-4xl mx-auto px-4 text-center">
      <p class="text-emerald-200">&copy; ${new Date().getFullYear()} Hotel Termal Peshkopi. Të gjitha të drejtat e rezervuara.</p>
    </div>
  </footer>
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

// Blog single post page
app.get('/blog/:slug', (c) => {
  const slug = c.req.param('slug')
  const post = postsData.find(p => p.slug === slug)
  if (!post) {
    return c.html('<h1>Post not found</h1>', 404)
  }
  return c.html(getBlogPostHTML(post))
})

export default app
