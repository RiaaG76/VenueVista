package com.venuevista.config;

import com.venuevista.entity.*;
import com.venuevista.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Seeds demo data into MySQL database for college-demo MVP presentation.
 * Accurately aligns with the existing frontend categories, events, and venues.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final EventCategoryRepository eventCategoryRepository;
    private final VenueCategoryRepository venueCategoryRepository;
    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final TicketBookingRepository ticketBookingRepository;
    private final VenueInquiryRepository venueInquiryRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           EventCategoryRepository eventCategoryRepository,
                           VenueCategoryRepository venueCategoryRepository,
                           EventRepository eventRepository,
                           VenueRepository venueRepository,
                           TicketBookingRepository ticketBookingRepository,
                           VenueInquiryRepository venueInquiryRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.eventCategoryRepository = eventCategoryRepository;
        this.venueCategoryRepository = venueCategoryRepository;
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
        this.ticketBookingRepository = ticketBookingRepository;
        this.venueInquiryRepository = venueInquiryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        log.info("Starting VenueVista Data Seeding Verification...");

        Map<String, User> userMap = seedUsers();
        Map<String, EventCategory> eventCatMap = seedEventCategories();
        Map<String, VenueCategory> venueCatMap = seedVenueCategories();
        Map<String, Event> eventMap = seedEvents(eventCatMap);
        Map<String, Venue> venueMap = seedVenues(venueCatMap);
        seedBookings(eventMap, userMap.get("demo@venuevista.in"));
        seedInquiries(venueMap, userMap.get("demo@venuevista.in"));

        log.info("VenueVista Data Seeding Completed Successfully.");
    }

    private Map<String, User> seedUsers() {
        Map<String, User> users = new HashMap<>();

        if (!userRepository.existsByEmail("demo@venuevista.in")) {
            User demoUser = new User("Aarav Sharma", "demo@venuevista.in", passwordEncoder.encode("DemoUser@2026"),
                    "+91 98765 43210", Role.ROLE_USER);
            demoUser.setEmailVerified(Boolean.TRUE);
            demoUser.setPhoneVerified(Boolean.TRUE);
            users.put("demo@venuevista.in", userRepository.save(demoUser));
        } else {
            User existing = userRepository.findByEmail("demo@venuevista.in").orElse(null);
            if (existing != null && (!Boolean.TRUE.equals(existing.getEmailVerified()) || !Boolean.TRUE.equals(existing.getPhoneVerified()))) {
                existing.setEmailVerified(Boolean.TRUE);
                existing.setPhoneVerified(Boolean.TRUE);
                userRepository.save(existing);
            }
            users.put("demo@venuevista.in", existing);
        }

        if (!userRepository.existsByEmail("admin@venuevista.in")) {
            User adminUser = new User("VenueVista Admin", "admin@venuevista.in", passwordEncoder.encode("Admin@2026"),
                    "+91 98111 22233", Role.ROLE_ADMIN);
            adminUser.setEmailVerified(Boolean.TRUE);
            adminUser.setPhoneVerified(Boolean.TRUE);
            users.put("admin@venuevista.in", userRepository.save(adminUser));
        } else {
            User existing = userRepository.findByEmail("admin@venuevista.in").orElse(null);
            if (existing != null && (!Boolean.TRUE.equals(existing.getEmailVerified()) || !Boolean.TRUE.equals(existing.getPhoneVerified()))) {
                existing.setEmailVerified(Boolean.TRUE);
                existing.setPhoneVerified(Boolean.TRUE);
                userRepository.save(existing);
            }
            users.put("admin@venuevista.in", existing);
        }

        if (!userRepository.existsByEmail("organizer@venuevista.in")) {
            User orgUser = new User("Priya Patel", "organizer@venuevista.in", passwordEncoder.encode("Organizer@2026"),
                    "+91 98222 33344", Role.ROLE_ORGANIZER);
            orgUser.setEmailVerified(Boolean.TRUE);
            orgUser.setPhoneVerified(Boolean.TRUE);
            users.put("organizer@venuevista.in", userRepository.save(orgUser));
        } else {
            User existing = userRepository.findByEmail("organizer@venuevista.in").orElse(null);
            if (existing != null && (!Boolean.TRUE.equals(existing.getEmailVerified()) || !Boolean.TRUE.equals(existing.getPhoneVerified()))) {
                existing.setEmailVerified(Boolean.TRUE);
                existing.setPhoneVerified(Boolean.TRUE);
                userRepository.save(existing);
            }
            users.put("organizer@venuevista.in", existing);
        }

        return users;
    }

    private Map<String, EventCategory> seedEventCategories() {
        Map<String, EventCategory> map = new HashMap<>();
        if (eventCategoryRepository.count() == 0) {
            EventCategory music = new EventCategory(
                    "Music", "music", "/events/music", "Music & Concerts",
                    "Live arena concerts, acoustic twilight evenings, Bollywood fusion & indie gigs.",
                    "From electrifying open-air arena music festivals to intimate sufi-acoustic twilight sessions, explore premier live musical performances across Mumbai, Delhi NCR, and Bengaluru.",
                    "🎵", "badge-music", "/assets/event-music.svg", 1
            );
            EventCategory tech = new EventCategory(
                    "Technology", "technology", "/events/technology", "Technology & AI",
                    "Generative AI summits, cloud microservices conclaves & developer expos.",
                    "Connect with India's premier software architects, AI founders, and cloud engineers exploring multimodal foundation models, distributed Kubernetes clusters, and low-latency system design.",
                    "💻", "badge-tech", "/assets/event-tech.svg", 2
            );
            EventCategory ws = new EventCategory(
                    "Workshops", "workshops", "/events/workshops", "Workshops & Design",
                    "Hands-on architecture sprints, UI/UX design studios & Kubernetes bootcamps.",
                    "Deep-dive intensive masterclasses and hands-on technical sprints covering distributed system architecture, Figma design tokens, WCAG AA accessibility, and automated CI/CD pipelines.",
                    "🛠️", "badge-workshops", "/assets/event-workshop.svg", 3
            );
            EventCategory sp = new EventCategory(
                    "Sports", "sports", "/events/sports", "Sports & Fitness",
                    "National badminton opens, night marathons & table tennis championships.",
                    "Experience thrilling live sports tournaments across India, from high-octane all-India badminton opens and midnight coastal marathons to competitive table tennis championships.",
                    "🏆", "badge-sports", "/assets/event-sports.svg", 4
            );
            EventCategory cf = new EventCategory(
                    "Conferences", "conferences", "/events/conferences", "Conferences & Summits",
                    "Clean energy leadership conclaves, FinTech summits & executive forums.",
                    "Flagship industry leadership conclaves bringing together policymakers, angel investors, and enterprise executives addressing clean energy, EV infrastructure, FinTech, and venture capital.",
                    "🎤", "badge-conferences", "/assets/event-conference.svg", 5
            );
            EventCategory th = new EventCategory(
                    "Theatre", "theatre", "/events/theatre", "Theatre & Musical",
                    "Grand Broadway-grade musicals, classical retellings & contemporary stage drama.",
                    "Immerse yourself in grand stage productions featuring Broadway-grade musical spectacles, classical Shakespeare adaptations in Hindustani cadences, and intimate experimental drama.",
                    "🎭", "badge-theatre", "/assets/event-theatre.svg", 6
            );

            map.put("music", eventCategoryRepository.save(music));
            map.put("technology", eventCategoryRepository.save(tech));
            map.put("workshops", eventCategoryRepository.save(ws));
            map.put("sports", eventCategoryRepository.save(sp));
            map.put("conferences", eventCategoryRepository.save(cf));
            map.put("theatre", eventCategoryRepository.save(th));
        } else {
            eventCategoryRepository.findAll().forEach(cat -> map.put(cat.getSlug(), cat));
        }
        return map;
    }

    private Map<String, VenueCategory> seedVenueCategories() {
        Map<String, VenueCategory> map = new HashMap<>();
        if (venueCategoryRepository.count() == 0) {
            VenueCategory banquet = new VenueCategory(
                    "Banquet Halls", "banquet-halls", "/venues/banquet-halls", "Banquet Halls",
                    "Grand chandeliers, bespoke catering infrastructure, plush seating & luxury bridal suites.",
                    "Opulent banquet halls featuring crystal chandeliers, dedicated buffet kitchens, plush banquet seating, and expansive valet parking suited for luxury weddings and milestone galas.",
                    "🏰", "badge-banquet", "/assets/venue-banquet-hall.svg", 1
            );
            VenueCategory auditorium = new VenueCategory(
                    "Auditoriums", "auditoriums", "/venues/auditoriums", "Auditoriums",
                    "Tiered acoustic seating, proscenium stages, 4K laser projection & VIP green rooms.",
                    "State-of-the-art auditoriums with engineered acoustic panelling, proscenium stages, 4K digital projection, symphony pits, and dual green rooms for award ceremonies and concerts.",
                    "🎭", "badge-auditorium", "/assets/venue-grand-auditorium.svg", 2
            );
            VenueCategory conference = new VenueCategory(
                    "Conference Centres", "conference-centres", "/venues/conference-centres", "Conference Centres",
                    "Executive conclave halls, hybrid AV conferencing, high-speed fiber & breakout boardrooms.",
                    "Premium executive conference centres equipped with hybrid audio-visual broadcast walls, gigabit fiber connectivity, ergonomic boardroom pods, and private lounges.",
                    "💼", "badge-conference-centre", "/assets/venue-conference-centre.svg", 3
            );
            VenueCategory convention = new VenueCategory(
                    "Convention Halls", "convention-halls", "/venues/convention-halls", "Convention Halls",
                    "Expansive modular expo bays, industrial power grids, heavy vehicle freight access & food courts.",
                    "Expansive multi-bay convention centres designed for massive international trade expos, hackathons, and consumer exhibitions with industrial power grids and freight elevators.",
                    "🌐", "badge-convention", "/assets/venue-tech-convention.svg", 4
            );
            VenueCategory lawn = new VenueCategory(
                    "Outdoor Lawns", "outdoor-lawns", "/venues/outdoor-lawns", "Outdoor Lawns",
                    "Lush manicured open-air grounds, twilight fairy lighting, open amphitheatres & valet parking.",
                    "Scenic manicured green lawns and amphitheaters surrounded by natural twilight ambience, festive fairy light trusses, and open-air stages for festivals and private celebrations.",
                    "🌿", "badge-lawn", "/assets/venue-heritage-lawn.svg", 5
            );
            VenueCategory party = new VenueCategory(
                    "Party Venues", "party-venues", "/venues/party-venues", "Party Venues",
                    "Skyline rooftop lounges, mirror disco balls, concert-grade acoustic sound & DJ stages.",
                    "Vibrant rooftop party venues with panoramic city skyline views, illuminated dance floors, mirror disco balls, and club-grade sound systems for cocktail parties and DJ nights.",
                    "🎉", "badge-party", "/assets/venue-party-venue.svg", 6
            );

            map.put("banquet-halls", venueCategoryRepository.save(banquet));
            map.put("auditoriums", venueCategoryRepository.save(auditorium));
            map.put("conference-centres", venueCategoryRepository.save(conference));
            map.put("convention-halls", venueCategoryRepository.save(convention));
            map.put("outdoor-lawns", venueCategoryRepository.save(lawn));
            map.put("party-venues", venueCategoryRepository.save(party));
        } else {
            venueCategoryRepository.findAll().forEach(cat -> map.put(cat.getSlug(), cat));
        }
        return map;
    }

    private Map<String, Event> seedEvents(Map<String, EventCategory> cats) {
        Map<String, Event> map = new HashMap<>();
        if (eventRepository.count() == 0) {
            Event[] events = new Event[]{
                    // Music (3)
                    new Event("evt-music-1", "Acoustic Bollywood & Indie Sunsets 2026",
                            cats.get("music"), "Sat, 14 Nov 2026 • 7:00 PM IST",
                            LocalDateTime.of(2026, 11, 14, 19, 0),
                            "NESCO Open Amphitheatre", "Mumbai", new BigDecimal("999.00"),
                            "/assets/categories/music-concert.jpg", "BlueTree Live India",
                            "An intimate open-air twilight concert featuring India's top indie singer-songwriters, fusion sarod-guitar duets, and sunset skyline views overlooking Mumbai.",
                            500, 420, true),
                    new Event("evt-music-2", "Sufi & Qawwali Fusion Heritage Night",
                            cats.get("music"), "Fri, 20 Nov 2026 • 7:30 PM IST",
                            LocalDateTime.of(2026, 11, 20, 19, 30),
                            "Siri Fort Auditorium", "New Delhi", new BigDecimal("1299.00"),
                            "/assets/categories/music-concert.jpg", "Dastangoi Sufi Society",
                            "A mesmerizing evening of classical qawwali harmonies blended with contemporary acoustic bass and live tabla rhythms in Delhi's iconic cultural auditorium.",
                            600, 510, true),
                    new Event("evt-music-3", "Bangalore Electronic Music Carnival (Sunburn Arena)",
                            cats.get("music"), "Sat, 28 Nov 2026 • 6:00 PM IST",
                            LocalDateTime.of(2026, 11, 28, 18, 0),
                            "Jayamahal Palace Grounds", "Bengaluru", new BigDecimal("1799.00"),
                            "/assets/event-music.svg", "Percept Live Events",
                            "Massive outdoor electronic music festival with international DJs, holographic laser stages, curated artisan food pop-ups, and 10,000+ passionate music fans.",
                            2000, 1850, true),

                    // Technology (3)
                    new Event("evt-tech-1", "India TechSparks AI & Cloud Summit 2026",
                            cats.get("technology"), "Thu, 19 Nov 2026 • 9:30 AM IST",
                            LocalDateTime.of(2026, 11, 19, 9, 30),
                            "BIEC Convention Centre, Tumkur Road", "Bengaluru", new BigDecimal("2499.00"),
                            "/assets/categories/technology.jpg", "TechSparks India Council",
                            "Connect with India's leading AI engineers, venture founders, and cloud architects exploring LLM agents, scalable microservices, and silicon innovations.",
                            1200, 980, true),
                    new Event("evt-tech-2", "Hyderabad GenAI Developers Conclave",
                            cats.get("technology"), "Sat, 05 Dec 2026 • 10:00 AM IST",
                            LocalDateTime.of(2026, 12, 5, 10, 0),
                            "HICC Novotel Arena, Hitec City", "Hyderabad", new BigDecimal("1999.00"),
                            "/assets/categories/technology.jpg", "Telangana Tech Forum",
                            "A deep-dive technical conclave on multimodal models, retrieval-augmented generation architectures, and sovereign AI deployment on domestic cloud clusters.",
                            800, 710, true),
                    new Event("evt-tech-3", "Pune Kubernetes & Distributed Systems Expo",
                            cats.get("technology"), "Fri, 11 Dec 2026 • 9:00 AM IST",
                            LocalDateTime.of(2026, 12, 11, 9, 0),
                            "Auto Cluster Exhibition Center, Chinchwad", "Pune", new BigDecimal("1499.00"),
                            "/assets/event-tech.svg", "CloudNative Community Pune",
                            "Hands-on tech sessions covering eBPF observability, Istio service mesh, zero-trust container security, and high-throughput Kafka streaming backbones.",
                            600, 490, true),

                    // Workshops (3)
                    new Event("evt-ws-1", "Full-Stack System Design & Microservices Sprint",
                            cats.get("workshops"), "Sun, 22 Nov 2026 • 10:00 AM IST",
                            LocalDateTime.of(2026, 11, 22, 10, 0),
                            "WeWork Galaxy, Residency Road", "Bengaluru", new BigDecimal("1299.00"),
                            "/assets/categories/workshop.jpeg", "CodeCraft India",
                            "An interactive 6-hour intensive architecture sprint designing low-latency payment rails, distributed locks, database sharding, and resilience patterns.",
                            150, 110, true),
                    new Event("evt-ws-2", "Mumbai UI/UX Design & Product Studio Masterclass",
                            cats.get("workshops"), "Sat, 28 Nov 2026 • 11:00 AM IST",
                            LocalDateTime.of(2026, 11, 28, 11, 0),
                            "91springboard, BKC Kurla", "Mumbai", new BigDecimal("1499.00"),
                            "/assets/categories/workshop.jpeg", "Design Guild Bombay",
                            "Master modern Figma design tokens, micro-interactions, responsive typographic scales, and WCAG AA accessibility patterns for high-growth consumer apps.",
                            120, 95, true),
                    new Event("evt-ws-3", "Delhi Cloud-Native DevOps Hands-on Bootcamp",
                            cats.get("workshops"), "Sun, 06 Dec 2026 • 10:00 AM IST",
                            LocalDateTime.of(2026, 12, 6, 10, 0),
                            "Innov8 Coworking, Connaught Place", "New Delhi", new BigDecimal("1199.00"),
                            "/assets/event-workshop.svg", "DevOps Bharat",
                            "Live coding walkthrough covering Terraform infrastructure-as-code, GitHub Actions CI/CD pipelines, Docker container optimization, and ArgoCD rollouts.",
                            100, 75, true),

                    // Sports (3)
                    new Event("evt-sp-1", "All-India Inter-City Badminton Masters 2026",
                            cats.get("sports"), "Sat, 21 Nov 2026 • 8:30 AM IST",
                            LocalDateTime.of(2026, 11, 21, 8, 30),
                            "Gachibowli Indoor Stadium", "Hyderabad", new BigDecimal("499.00"),
                            "/assets/categories/sports.jpeg", "Badminton Association of India (BAI)",
                            "Watch top national singles and doubles shuttlers battle for championship ranking points in a high-octane indoor stadium setting.",
                            1500, 1340, true),
                    new Event("evt-sp-2", "Mumbai Midnight Coast Marathon & Fitness Expo",
                            cats.get("sports"), "Sat, 05 Dec 2026 • 11:00 PM IST",
                            LocalDateTime.of(2026, 12, 5, 23, 0),
                            "Marine Drive Promenade to Bandra Worli Sea Link", "Mumbai", new BigDecimal("799.00"),
                            "/assets/categories/sports.jpeg", "Run Mumbai Foundation",
                            "A scenic 10K and 21K night marathon along Mumbai's iconic sea-breeze coastline with RFID timing bibs, hydration zones, and sunrise finisher medals.",
                            3000, 2650, true),
                    new Event("evt-sp-3", "Bengaluru Ultimate Table Tennis Championship",
                            cats.get("sports"), "Sun, 13 Dec 2026 • 9:00 AM IST",
                            LocalDateTime.of(2026, 12, 13, 9, 0),
                            "Kanteerava Indoor Stadium", "Bengaluru", new BigDecimal("399.00"),
                            "/assets/event-sports.svg", "Karnataka State TT Federation",
                            "Electrifying table tennis action featuring Olympic and Commonwealth athletes competing in singles and mixed team knockout showdowns.",
                            1000, 890, true),

                    // Conferences (3)
                    new Event("evt-cf-1", "India Clean Energy & EV Infrastructure Leadership Conclave",
                            cats.get("conferences"), "Wed, 25 Nov 2026 • 9:00 AM IST",
                            LocalDateTime.of(2026, 11, 25, 9, 0),
                            "Bharat Mandapam (IECC), Pragati Maidan", "New Delhi", new BigDecimal("3499.00"),
                            "/assets/categories/conference.jpeg", "Ministry of Power & Renewable Energy Alliances",
                            "India's flagship policymaker and corporate conclave addressing battery gigafactories, solar grid parity, green hydrogen, and EV charging corridors.",
                            2500, 2180, true),
                    new Event("evt-cf-2", "Mumbai Global FinTech & Banking Innovations Conclave",
                            cats.get("conferences"), "Fri, 04 Dec 2026 • 9:30 AM IST",
                            LocalDateTime.of(2026, 12, 4, 9, 30),
                            "Jio World Convention Centre, BKC", "Mumbai", new BigDecimal("3999.00"),
                            "/assets/categories/conference.jpeg", "FinTech Leaders Forum India",
                            "Meet senior bankers, payment gateway executives, and venture investors discussing UPI global integrations, CBDC digital rupee, and AI fraud prevention.",
                            1800, 1620, true),
                    new Event("evt-cf-3", "Bangalore Founders & Angel Capital Conclave",
                            cats.get("conferences"), "Thu, 17 Dec 2026 • 10:00 AM IST",
                            LocalDateTime.of(2026, 12, 17, 10, 0),
                            "The Leela Palace Ballrooms, Old Airport Road", "Bengaluru", new BigDecimal("2999.00"),
                            "/assets/event-conference.svg", "VentureVista Angel Network",
                            "Curated 1-on-1 investor matchmaking, speed pitching stages, and fireside chats with India's newest unicorn founders.",
                            500, 430, true),

                    // Theatre (3)
                    new Event("evt-th-1", "Mughal-e-Azam: The Grand Musical Spectacular",
                            cats.get("theatre"), "Sun, 29 Nov 2026 • 6:30 PM IST",
                            LocalDateTime.of(2026, 11, 29, 18, 30),
                            "NMACC Grand Theatre, BKC", "Mumbai", new BigDecimal("1999.00"),
                            "/assets/categories/theatre.jpg", "Feroz Abbas Khan Productions",
                            "Broadway-grade musical extravaganza with 300+ live Kathak dancers, Manish Malhotra royal costumes, and mesmerizing live acoustic vocals.",
                            1500, 1210, true),
                    new Event("evt-th-2", "Delhi Classical Shakespeare Retelling: King Lear in Hindustani",
                            cats.get("theatre"), "Sat, 12 Dec 2026 • 7:00 PM IST",
                            LocalDateTime.of(2026, 12, 12, 19, 0),
                            "Kamani Auditorium, Mandi House", "New Delhi", new BigDecimal("899.00"),
                            "/assets/categories/theatre.jpg", "National School of Drama Ensemble",
                            "A powerful adaptation blending classic Elizabethan tragedy with Hindustani poetic cadences and traditional Indian percussion.",
                            650, 580, true),
                    new Event("evt-th-3", "Bengaluru Contemporary Experimental Stage Play: Silence Speaks",
                            cats.get("theatre"), "Fri, 18 Dec 2026 • 7:30 PM IST",
                            LocalDateTime.of(2026, 12, 18, 19, 30),
                            "Ranga Shankara, JP Nagar", "Bengaluru", new BigDecimal("699.00"),
                            "/assets/event-theatre.svg", "The Playpen Collective",
                            "An award-winning intimate physical theatre performance tackling modern existentialism, urban solitude, and human connection in the digital age.",
                            300, 260, true)
            };

            for (Event e : events) {
                map.put(e.getCode(), eventRepository.save(e));
            }
        } else {
            eventRepository.findAll().forEach(e -> map.put(e.getCode(), e));
        }
        return map;
    }

    private Map<String, Venue> seedVenues(Map<String, VenueCategory> cats) {
        Map<String, Venue> map = new HashMap<>();
        if (venueRepository.count() == 0) {
            Venue[] venues = new Venue[]{
                    new Venue("ven-101", "The Monarch Crystal Ballroom",
                            cats.get("banquet-halls"), "Jubilee Hills, Hyderabad", "Hyderabad",
                            "600 Guests", 600, new BigDecimal("65000.00"),
                            "/assets/venue-banquet-hall.svg",
                            "Weddings, Corporate Receptions, Gala Dinners",
                            "Grand Crystal Chandeliers, Bridal Suites, Bespoke Buffet Kitchen, 250 Valet Slots",
                            true),
                    new Venue("ven-102", "Taj Lands End Grand Ballroom",
                            cats.get("banquet-halls"), "Bandstand, Bandra West, Mumbai", "Mumbai",
                            "750 Guests", 750, new BigDecimal("95000.00"),
                            "/assets/venue-banquet-hall.svg",
                            "Celebrity Galas, Luxury Banquets, Milestone Celebrations",
                            "Sea View Lawns Access, High-Ceiling Acoustics, Five-Star Catering, VIP Portico",
                            true),
                    new Venue("ven-201", "The Grand Imperial Auditorium",
                            cats.get("auditoriums"), "Connaught Place, New Delhi", "New Delhi",
                            "1,500 Guests", 1500, new BigDecimal("75000.00"),
                            "/assets/venue-grand-auditorium.svg",
                            "Keynote Conclaves, Award Shows, Stage Plays",
                            "Acoustic Paneling, 4K Laser Projection, VIP Green Rooms, 3-Phase Power",
                            true),
                    new Venue("ven-202", "Sir Mutha Concert & Cultural Hall",
                            cats.get("auditoriums"), "Chetpet, Chennai", "Chennai",
                            "1,200 Guests", 1200, new BigDecimal("60000.00"),
                            "/assets/venue-grand-auditorium.svg",
                            "Classical Concerts, Corporate Convocations, Theatre",
                            "Symphony Orchestra Pit, Yamaha Audio System, Dual Green Rooms, Central Air Conditioning",
                            true),
                    new Venue("ven-301", "Apex Executive Conference Centre",
                            cats.get("conference-centres"), "Senapati Bapat Road, Pune", "Pune",
                            "350 Guests", 350, new BigDecimal("40000.00"),
                            "/assets/venue-conference-centre.svg",
                            "Board Meetings, Executive Summits, Tech Hackathons",
                            "Hybrid AV Conclave Setup, 1 Gbps Fiber Wi-Fi, Four Breakout Pods, Ergonomic Seating",
                            true),
                    new Venue("ven-401", "Silicon Vista Convention Centre",
                            cats.get("convention-halls"), "Whitefield, Bengaluru", "Bengaluru",
                            "2,500 Guests", 2500, new BigDecimal("120000.00"),
                            "/assets/venue-tech-convention.svg",
                            "Tech Hackathons, Product Launches, Trade Expos",
                            "Gigabit Fiber Wi-Fi, Modular Walls, Freight Elevator, Banquet Kitchen",
                            true),
                    new Venue("ven-402", "Pragati Mega Conclave Expo Centre",
                            cats.get("convention-halls"), "Mathura Road, New Delhi", "New Delhi",
                            "5,000 Guests", 5000, new BigDecimal("200000.00"),
                            "/assets/venue-tech-convention.svg",
                            "Mega International Expos, Tech Summits, Auto Exhibitions",
                            "Heavy Industrial Power, Direct Metro Subway Link, Truck Loading Bays, 40,000 Sq.Ft Bay",
                            true),
                    new Venue("ven-501", "Royal Bay Amphitheatre & Lawns",
                            cats.get("outdoor-lawns"), "Bandra West, Mumbai", "Mumbai",
                            "800 Guests", 800, new BigDecimal("55000.00"),
                            "/assets/venue-heritage-lawn.svg",
                            "Music Concerts, Wedding Receptions, Cultural Evenings",
                            "Ocean-Breeze Stage, Fairy Light Truss, Banquet Lawn, 200+ Valet Parking",
                            true),
                    new Venue("ven-601", "Marina Bay Rooftop & Party Lounge",
                            cats.get("party-venues"), "ECR Coastal Road, Chennai", "Chennai",
                            "250 Guests", 250, new BigDecimal("45000.00"),
                            "/assets/venue-party-venue.svg",
                            "Cocktail Galas, DJ Evenings, Product Afterparties",
                            "Illuminated Dancefloor, Coastal Skyline Bar, Bass Rig Sound, Laser Lighting",
                            true)
            };

            for (Venue v : venues) {
                map.put(v.getCode(), venueRepository.save(v));
            }
        } else {
            venueRepository.findAll().forEach(v -> map.put(v.getCode(), v));
        }
        return map;
    }

    private void seedBookings(Map<String, Event> eventMap, User demoUser) {
        if (ticketBookingRepository.count() == 0 && demoUser != null) {
            Event musicEvt = eventMap.get("evt-music-1");
            if (musicEvt != null) {
                TicketBooking b1 = new TicketBooking(
                        "VV-BK-2026-DEMO1", musicEvt, demoUser, "Aarav Sharma",
                        "demo@venuevista.in", "+91 98765 43210", "General Admission",
                        2, new BigDecimal("999.00"), new BigDecimal("1998.00"),
                        BookingStatus.CONFIRMED, "Demo booking for college presentation"
                );
                ticketBookingRepository.save(b1);
            }

            Event techEvt = eventMap.get("evt-tech-1");
            if (techEvt != null) {
                TicketBooking b2 = new TicketBooking(
                        "VV-BK-2026-DEMO2", techEvt, demoUser, "Aarav Sharma",
                        "demo@venuevista.in", "+91 98765 43210", "VIP Delegate Pass",
                        1, new BigDecimal("2499.00"), new BigDecimal("2499.00"),
                        BookingStatus.CONFIRMED, "VIP Access Badge"
                );
                ticketBookingRepository.save(b2);
            }
        }
    }

    private void seedInquiries(Map<String, Venue> venueMap, User demoUser) {
        if (venueInquiryRepository.count() == 0 && demoUser != null) {
            Venue v1 = venueMap.get("ven-101");
            if (v1 != null) {
                VenueInquiry inq1 = new VenueInquiry(
                        "VV-INQ-2026-DEMO1", v1, demoUser, "Aarav Sharma",
                        "demo@venuevista.in / +91 98765 43210", "Corporate Gala Dinner",
                        LocalDate.of(2026, 12, 18), "450 Guests", "Full Day (8 Hours)",
                        new BigDecimal("65000.00"), InquiryStatus.SUBMITTED,
                        "Need banquet catering and presentation audio setup."
                );
                venueInquiryRepository.save(inq1);
            }

            Venue v2 = venueMap.get("ven-401");
            if (v2 != null) {
                VenueInquiry inq2 = new VenueInquiry(
                        "VV-INQ-2026-DEMO2", v2, demoUser, "Aarav Sharma",
                        "demo@venuevista.in / +91 98765 43210", "Annual Tech Hackathon",
                        LocalDate.of(2026, 12, 22), "1,200 Participants", "Full Day (12 Hours)",
                        new BigDecimal("120000.00"), InquiryStatus.UNDER_REVIEW,
                        "Require high-speed Wi-Fi and modular booth partitions."
                );
                venueInquiryRepository.save(inq2);
            }
        }
    }
}
