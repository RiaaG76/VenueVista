/**
 * VenueVista - Frontend Application
 * Pure Vanilla JavaScript (ES6+)
 * Client-Side Router using the History API (pushState, popstate)
 * Distinct Page Routes for Events and Venue Discovery
 */

'use strict';

const VenueVista = (() => {
    // Application configuration
    const CONFIG = {
        appName: 'VenueVista',
        version: '0.2.0',
        locale: 'en-IN',
        currency: 'INR',
        themeStorageKey: 'vv_theme',
        apiBaseUrl: (typeof window !== 'undefined' && window.VENUEVISTA_API_URL) ? window.VENUEVISTA_API_URL : 'https://venuevista-backend-kspi.onrender.com',
        tokenStorageKey: 'vv_token',
        userStorageKey: 'vv_user'
    };

    // Indian Rupee currency formatter
    const inrFormatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    });

    /**
     * Centralized Frontend API Client for VenueVista Spring Boot REST MVP
     * Handles JSON envelopes, JWT bearer authorization, and error formatting consistently.
     */
    const apiClient = {
        async request(endpoint, options = {}) {
            const url = `${CONFIG.apiBaseUrl}${endpoint}`;
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers
            };

            const token = localStorage.getItem(CONFIG.tokenStorageKey);
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            try {
                const response = await fetch(url, {
                    ...options,
                    headers
                });

                const text = await response.text();
                let json = null;
                if (text) {
                    try {
                        json = JSON.parse(text);
                    } catch (e) {
                        json = { message: text };
                    }
                }

                if (!response.ok) {
                    const message = (json && json.message) || `HTTP Error ${response.status}: ${response.statusText}`;
                    const error = new Error(message);
                    error.status = response.status;
                    error.data = json;
                    throw error;
                }

                return json;
            } catch (err) {
                if (err.name === 'TypeError' && err.message && err.message.toLowerCase().includes('fetch')) {
                    const connErr = new Error(`Cannot connect to VenueVista backend server at ${CONFIG.apiBaseUrl}. Ensure the Spring Boot service is active.`);
                    connErr.status = 0;
                    throw connErr;
                }
                throw err;
            }
        },

        get(endpoint, params = {}) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([k, v]) => {
                if (v !== undefined && v !== null && v !== '') {
                    searchParams.append(k, v);
                }
            });
            const qs = searchParams.toString();
            return this.request(qs ? `${endpoint}?${qs}` : endpoint, { method: 'GET' });
        },

        post(endpoint, body = {}) {
            return this.request(endpoint, {
                method: 'POST',
                body: JSON.stringify(body)
            });
        }
    };

    // Six Event Categories with dedicated route slugs and descriptions (using user-supplied category photographs)
    const EVENT_CATEGORIES = [
        {
            key: 'Music',
            slug: 'music',
            path: '/events/music',
            title: 'Music & Concerts',
            tagline: 'Live arena concerts, acoustic twilight evenings, Bollywood fusion & indie gigs.',
            description: 'From electrifying open-air arena music festivals to intimate sufi-acoustic twilight sessions, explore premier live musical performances across Mumbai, Delhi NCR, and Bengaluru.',
            icon: '🎵',
            badgeClass: 'badge-music',
            image: '/assets/categories/music-concert.jpg',
            eventCount: 3
        },
        {
            key: 'Technology',
            slug: 'technology',
            path: '/events/technology',
            title: 'Technology & AI',
            tagline: 'Generative AI summits, cloud microservices conclaves & developer expos.',
            description: 'Connect with India\'s premier software architects, AI founders, and cloud engineers exploring multimodal foundation models, distributed Kubernetes clusters, and low-latency system design.',
            icon: '💻',
            badgeClass: 'badge-tech',
            image: '/assets/categories/technology.jpg',
            eventCount: 3
        },
        {
            key: 'Workshops',
            slug: 'workshops',
            path: '/events/workshops',
            title: 'Workshops & Design',
            tagline: 'Hands-on architecture sprints, UI/UX design studios & Kubernetes bootcamps.',
            description: 'Deep-dive intensive masterclasses and hands-on technical sprints covering distributed system architecture, Figma design tokens, WCAG AA accessibility, and automated CI/CD pipelines.',
            icon: '🛠️',
            badgeClass: 'badge-workshops',
            image: '/assets/categories/workshop.jpeg',
            eventCount: 3
        },
        {
            key: 'Sports',
            slug: 'sports',
            path: '/events/sports',
            title: 'Sports & Fitness',
            tagline: 'National badminton opens, night marathons & table tennis championships.',
            description: 'Experience thrilling live sports tournaments across India, from high-octane all-India badminton opens and midnight coastal marathons to competitive table tennis championships.',
            icon: '🏆',
            badgeClass: 'badge-sports',
            image: '/assets/categories/sports.jpeg',
            eventCount: 3
        },
        {
            key: 'Conferences',
            slug: 'conferences',
            path: '/events/conferences',
            title: 'Conferences & Summits',
            tagline: 'Clean energy leadership conclaves, FinTech summits & executive forums.',
            description: 'Flagship industry leadership conclaves bringing together policymakers, angel investors, and enterprise executives addressing clean energy, EV infrastructure, FinTech, and venture capital.',
            icon: '🎤',
            badgeClass: 'badge-conferences',
            image: '/assets/categories/conference.jpeg',
            eventCount: 3
        },
        {
            key: 'Theatre',
            slug: 'theatre',
            path: '/events/theatre',
            title: 'Theatre & Musical',
            tagline: 'Grand Broadway-grade musicals, classical retellings & contemporary stage drama.',
            description: 'Immerse yourself in grand stage productions featuring Broadway-grade musical spectacles, classical Shakespeare adaptations in Hindustani cadences, and intimate experimental drama.',
            icon: '🎭',
            badgeClass: 'badge-theatre',
            image: '/assets/categories/theatre.jpg',
            eventCount: 3
        }
    ];

    // Six Venue Categories with dedicated route slugs and descriptions
    const VENUE_CATEGORIES = [
        {
            key: 'Banquet Halls',
            slug: 'banquet-halls',
            path: '/venues/banquet-halls',
            title: 'Banquet Halls',
            tagline: 'Grand chandeliers, bespoke catering infrastructure, plush seating & luxury bridal suites.',
            description: 'Opulent banquet halls featuring crystal chandeliers, dedicated buffet kitchens, plush banquet seating, and expansive valet parking suited for luxury weddings and milestone galas.',
            icon: '🏰',
            badgeClass: 'badge-banquet',
            image: '/assets/venue-banquet-hall.svg',
            venueCount: 2
        },
        {
            key: 'Auditoriums',
            slug: 'auditoriums',
            path: '/venues/auditoriums',
            title: 'Auditoriums',
            tagline: 'Tiered acoustic seating, proscenium stages, 4K laser projection & VIP green rooms.',
            description: 'State-of-the-art auditoriums with engineered acoustic panelling, proscenium stages, 4K digital projection, symphony pits, and dual green rooms for award ceremonies and concerts.',
            icon: '🎭',
            badgeClass: 'badge-auditorium',
            image: '/assets/venue-grand-auditorium.svg',
            venueCount: 2
        },
        {
            key: 'Conference Centres',
            slug: 'conference-centres',
            path: '/venues/conference-centres',
            title: 'Conference Centres',
            tagline: 'Executive conclave halls, hybrid AV conferencing, high-speed fiber & breakout boardrooms.',
            description: 'Premium executive conference centres equipped with hybrid audio-visual broadcast walls, gigabit fiber connectivity, ergonomic boardroom pods, and private lounges.',
            icon: '💼',
            badgeClass: 'badge-conference-centre',
            image: '/assets/venue-conference-centre.svg',
            venueCount: 1
        },
        {
            key: 'Convention Halls',
            slug: 'convention-halls',
            path: '/venues/convention-halls',
            title: 'Convention Halls',
            tagline: 'Expansive modular expo bays, industrial power grids, heavy vehicle freight access & food courts.',
            description: 'Expansive multi-bay convention centres designed for massive international trade expos, hackathons, and consumer exhibitions with industrial power grids and freight elevators.',
            icon: '🌐',
            badgeClass: 'badge-convention',
            image: '/assets/venue-tech-convention.svg',
            venueCount: 2
        },
        {
            key: 'Outdoor Lawns',
            slug: 'outdoor-lawns',
            path: '/venues/outdoor-lawns',
            title: 'Outdoor Lawns',
            tagline: 'Lush manicured open-air grounds, twilight fairy lighting, open amphitheatres & valet parking.',
            description: 'Scenic manicured green lawns and amphitheaters surrounded by natural twilight ambience, festive fairy light trusses, and open-air stages for festivals and private celebrations.',
            icon: '🌿',
            badgeClass: 'badge-lawn',
            image: '/assets/venue-heritage-lawn.svg',
            venueCount: 1
        },
        {
            key: 'Party Venues',
            slug: 'party-venues',
            path: '/venues/party-venues',
            title: 'Party Venues',
            tagline: 'Skyline rooftop lounges, mirror disco balls, concert-grade acoustic sound & DJ stages.',
            description: 'Vibrant rooftop party venues with panoramic city skyline views, illuminated dance floors, mirror disco balls, and club-grade sound systems for cocktail parties and DJ nights.',
            icon: '🎉',
            badgeClass: 'badge-party',
            image: '/assets/venue-party-venue.svg',
            venueCount: 1
        }
    ];

    // 18 Realistic India-First Sample Events (At least 3 events per category)
    const SAMPLE_EVENTS = [
        // --- 1. Music (3 Events) ---
        {
            id: 'evt-music-1',
            title: 'Acoustic Bollywood & Indie Sunsets 2026',
            category: 'Music',
            categorySlug: 'music',
            categoryBadgeClass: 'badge-music',
            categoryIcon: '🎵',
            dateTime: 'Sat, 14 Nov 2026 • 7:00 PM IST',
            venue: 'NESCO Open Amphitheatre',
            city: 'Mumbai',
            startingPrice: 999,
            totalSeats: 500,
            availableSeats: 420,
            image: '/assets/categories/music-concert.jpg',
            organizer: 'BlueTree Live India',
            description: 'An intimate open-air twilight concert featuring India\'s top indie singer-songwriters, fusion sarod-guitar duets, and sunset skyline views overlooking Mumbai.'
        },
        {
            id: 'evt-music-2',
            title: 'Sufi & Qawwali Fusion Heritage Night',
            category: 'Music',
            categorySlug: 'music',
            categoryBadgeClass: 'badge-music',
            categoryIcon: '🎵',
            dateTime: 'Fri, 20 Nov 2026 • 7:30 PM IST',
            venue: 'Siri Fort Auditorium',
            city: 'New Delhi',
            startingPrice: 1299,
            totalSeats: 600,
            availableSeats: 510,
            image: '/assets/categories/music.jpg',
            organizer: 'Dastangoi Sufi Society',
            description: 'A mesmerizing evening of classical qawwali harmonies blended with contemporary acoustic bass and live tabla rhythms in Delhi\'s iconic cultural auditorium.'
        },
        {
            id: 'evt-music-3',
            title: 'Bangalore Electronic Music Carnival (Sunburn Arena)',
            category: 'Music',
            categorySlug: 'music',
            categoryBadgeClass: 'badge-music',
            categoryIcon: '🎵',
            dateTime: 'Sat, 28 Nov 2026 • 6:00 PM IST',
            venue: 'Jayamahal Palace Grounds',
            city: 'Bengaluru',
            startingPrice: 1799,
            totalSeats: 2000,
            availableSeats: 1850,
            image: '/assets/categories/music-concert.jpg',
            organizer: 'Percept Live Events',
            description: 'Massive outdoor electronic music festival with international DJs, holographic laser stages, curated artisan food pop-ups, and 10,000+ passionate music fans.'
        },

        // --- 2. Technology (3 Events) ---
        {
            id: 'evt-tech-1',
            title: 'India TechSparks AI & Cloud Summit 2026',
            category: 'Technology',
            categorySlug: 'technology',
            categoryBadgeClass: 'badge-tech',
            categoryIcon: '💻',
            dateTime: 'Thu, 19 Nov 2026 • 9:30 AM IST',
            venue: 'BIEC Convention Centre, Tumkur Road',
            city: 'Bengaluru',
            startingPrice: 2499,
            totalSeats: 1200,
            availableSeats: 980,
            image: '/assets/categories/technology.jpg',
            organizer: 'TechSparks India Council',
            description: 'Connect with India\'s leading AI engineers, venture founders, and cloud architects exploring LLM agents, scalable microservices, and silicon innovations.'
        },
        {
            id: 'evt-tech-2',
            title: 'Hyderabad GenAI Developers Conclave',
            category: 'Technology',
            categorySlug: 'technology',
            categoryBadgeClass: 'badge-tech',
            categoryIcon: '💻',
            dateTime: 'Sat, 05 Dec 2026 • 10:00 AM IST',
            venue: 'HICC Novotel Arena, Hitec City',
            city: 'Hyderabad',
            startingPrice: 1999,
            totalSeats: 800,
            availableSeats: 710,
            image: '/assets/categories/technology.jpg',
            organizer: 'Telangana Tech Forum',
            description: 'A deep-dive technical conclave on multimodal models, retrieval-augmented generation architectures, and sovereign AI deployment on domestic cloud clusters.'
        },
        {
            id: 'evt-tech-3',
            title: 'Pune Kubernetes & Distributed Systems Expo',
            category: 'Technology',
            categorySlug: 'technology',
            categoryBadgeClass: 'badge-tech',
            categoryIcon: '💻',
            dateTime: 'Fri, 11 Dec 2026 • 9:00 AM IST',
            venue: 'Auto Cluster Exhibition Center, Chinchwad',
            city: 'Pune',
            startingPrice: 1499,
            totalSeats: 600,
            availableSeats: 490,
            image: '/assets/categories/technology.jpg',
            organizer: 'CloudNative Community Pune',
            description: 'Hands-on tech sessions covering eBPF observability, Istio service mesh, zero-trust container security, and high-throughput Kafka streaming backbones.'
        },

        // --- 3. Workshops (3 Events) ---
        {
            id: 'evt-ws-1',
            title: 'Full-Stack System Design & Microservices Sprint',
            category: 'Workshops',
            categorySlug: 'workshops',
            categoryBadgeClass: 'badge-workshops',
            categoryIcon: '🛠️',
            dateTime: 'Sun, 22 Nov 2026 • 10:00 AM IST',
            venue: 'WeWork Galaxy, Residency Road',
            city: 'Bengaluru',
            startingPrice: 1299,
            totalSeats: 150,
            availableSeats: 110,
            image: '/assets/categories/workshop.jpeg',
            organizer: 'CodeCraft India',
            description: 'An interactive 6-hour intensive architecture sprint designing low-latency payment rails, distributed locks, database sharding, and resilience patterns.'
        },
        {
            id: 'evt-ws-2',
            title: 'Mumbai UI/UX Design & Product Studio Masterclass',
            category: 'Workshops',
            categorySlug: 'workshops',
            categoryBadgeClass: 'badge-workshops',
            categoryIcon: '🛠️',
            dateTime: 'Sat, 28 Nov 2026 • 11:00 AM IST',
            venue: '91springboard, BKC Kurla',
            city: 'Mumbai',
            startingPrice: 1499,
            totalSeats: 120,
            availableSeats: 95,
            image: '/assets/categories/workshop.jpeg',
            organizer: 'Design Guild Bombay',
            description: 'Master modern Figma design tokens, micro-interactions, responsive typographic scales, and WCAG AA accessibility patterns for high-growth consumer apps.'
        },
        {
            id: 'evt-ws-3',
            title: 'Delhi Cloud-Native DevOps Hands-on Bootcamp',
            category: 'Workshops',
            categorySlug: 'workshops',
            categoryBadgeClass: 'badge-workshops',
            categoryIcon: '🛠️',
            dateTime: 'Sun, 06 Dec 2026 • 10:00 AM IST',
            venue: 'Innov8 Coworking, Connaught Place',
            city: 'New Delhi',
            startingPrice: 1199,
            totalSeats: 100,
            availableSeats: 75,
            image: '/assets/categories/workshop.jpeg',
            organizer: 'DevOps Bharat',
            description: 'Live coding walkthrough covering Terraform infrastructure-as-code, GitHub Actions CI/CD pipelines, Docker container optimization, and ArgoCD rollouts.'
        },

        // --- 4. Sports (3 Events) ---
        {
            id: 'evt-sp-1',
            title: 'All-India Inter-City Badminton Masters 2026',
            category: 'Sports',
            categorySlug: 'sports',
            categoryBadgeClass: 'badge-sports',
            categoryIcon: '🏆',
            dateTime: 'Sat, 21 Nov 2026 • 8:30 AM IST',
            venue: 'Gachibowli Indoor Stadium',
            city: 'Hyderabad',
            startingPrice: 499,
            totalSeats: 1500,
            availableSeats: 1340,
            image: '/assets/categories/sports.jpeg',
            organizer: 'Badminton Association of India (BAI)',
            description: 'Watch top national singles and doubles shuttlers battle for championship ranking points in a high-octane indoor stadium setting.'
        },
        {
            id: 'evt-sp-2',
            title: 'Mumbai Midnight Coast Marathon & Fitness Expo',
            category: 'Sports',
            categorySlug: 'sports',
            categoryBadgeClass: 'badge-sports',
            categoryIcon: '🏆',
            dateTime: 'Sat, 05 Dec 2026 • 11:00 PM IST',
            venue: 'Marine Drive Promenade to Bandra Worli Sea Link',
            city: 'Mumbai',
            startingPrice: 799,
            totalSeats: 3000,
            availableSeats: 2650,
            image: '/assets/categories/sports.jpeg',
            organizer: 'Run Mumbai Foundation',
            description: 'A scenic 10K and 21K night marathon along Mumbai\'s iconic sea-breeze coastline with RFID timing bibs, hydration zones, and sunrise finisher medals.'
        },
        {
            id: 'evt-sp-3',
            title: 'Bengaluru Ultimate Table Tennis Championship',
            category: 'Sports',
            categorySlug: 'sports',
            categoryBadgeClass: 'badge-sports',
            categoryIcon: '🏆',
            dateTime: 'Sun, 13 Dec 2026 • 9:00 AM IST',
            venue: 'Kanteerava Indoor Stadium',
            city: 'Bengaluru',
            startingPrice: 399,
            totalSeats: 1000,
            availableSeats: 890,
            image: '/assets/categories/sports.jpeg',
            organizer: 'Karnataka State TT Federation',
            description: 'Electrifying table tennis action featuring Olympic and Commonwealth athletes competing in singles and mixed team knockout showdowns.'
        },

        // --- 5. Conferences (3 Events) ---
        {
            id: 'evt-cf-1',
            title: 'India Clean Energy & EV Infrastructure Leadership Conclave',
            category: 'Conferences',
            categorySlug: 'conferences',
            categoryBadgeClass: 'badge-conferences',
            categoryIcon: '🎤',
            dateTime: 'Wed, 25 Nov 2026 • 9:00 AM IST',
            venue: 'Bharat Mandapam (IECC), Pragati Maidan',
            city: 'New Delhi',
            startingPrice: 3499,
            totalSeats: 2500,
            availableSeats: 2180,
            image: '/assets/categories/conference.jpeg',
            organizer: 'Ministry of Power & Renewable Energy Alliances',
            description: 'India\'s flagship policymaker and corporate conclave addressing battery gigafactories, solar grid parity, green hydrogen, and EV charging corridors.'
        },
        {
            id: 'evt-cf-2',
            title: 'Mumbai Global FinTech & Banking Innovations Conclave',
            category: 'Conferences',
            categorySlug: 'conferences',
            categoryBadgeClass: 'badge-conferences',
            categoryIcon: '🎤',
            dateTime: 'Fri, 04 Dec 2026 • 9:30 AM IST',
            venue: 'Jio World Convention Centre, BKC',
            city: 'Mumbai',
            startingPrice: 3999,
            totalSeats: 1800,
            availableSeats: 1620,
            image: '/assets/categories/conference.jpeg',
            organizer: 'FinTech Leaders Forum India',
            description: 'Meet senior bankers, payment gateway executives, and venture investors discussing UPI global integrations, CBDC digital rupee, and AI fraud prevention.'
        },
        {
            id: 'evt-cf-3',
            title: 'Bangalore Founders & Angel Capital Conclave',
            category: 'Conferences',
            categorySlug: 'conferences',
            categoryBadgeClass: 'badge-conferences',
            categoryIcon: '🎤',
            dateTime: 'Thu, 17 Dec 2026 • 10:00 AM IST',
            venue: 'The Leela Palace Ballrooms, Old Airport Road',
            city: 'Bengaluru',
            startingPrice: 2999,
            totalSeats: 500,
            availableSeats: 430,
            image: '/assets/categories/conference.jpeg',
            organizer: 'VentureVista Angel Network',
            description: 'Curated 1-on-1 investor matchmaking, speed pitching stages, and fireside chats with India\'s newest unicorn founders.'
        },

        // --- 6. Theatre (3 Events) ---
        {
            id: 'evt-th-1',
            title: 'Mughal-e-Azam: The Grand Musical Spectacular',
            category: 'Theatre',
            categorySlug: 'theatre',
            categoryBadgeClass: 'badge-theatre',
            categoryIcon: '🎭',
            dateTime: 'Sun, 29 Nov 2026 • 6:30 PM IST',
            venue: 'NMACC Grand Theatre, BKC',
            city: 'Mumbai',
            startingPrice: 1999,
            totalSeats: 1500,
            availableSeats: 1210,
            image: '/assets/categories/theatre.jpg',
            organizer: 'Feroz Abbas Khan Productions',
            description: 'Broadway-grade musical extravaganza with 300+ live Kathak dancers, Manish Malhotra royal costumes, and mesmerizing live acoustic vocals.'
        },
        {
            id: 'evt-th-2',
            title: 'Delhi Classical Shakespeare Retelling: King Lear in Hindustani',
            category: 'Theatre',
            categorySlug: 'theatre',
            categoryBadgeClass: 'badge-theatre',
            categoryIcon: '🎭',
            dateTime: 'Sat, 12 Dec 2026 • 7:00 PM IST',
            venue: 'Kamani Auditorium, Mandi House',
            city: 'New Delhi',
            startingPrice: 899,
            totalSeats: 650,
            availableSeats: 580,
            image: '/assets/categories/theatre.jpg',
            organizer: 'National School of Drama Ensemble',
            description: 'A powerful adaptation blending classic Elizabethan tragedy with Hindustani poetic cadences and traditional Indian percussion.'
        },
        {
            id: 'evt-th-3',
            title: 'Bengaluru Contemporary Experimental Stage Play: Silence Speaks',
            category: 'Theatre',
            categorySlug: 'theatre',
            categoryBadgeClass: 'badge-theatre',
            categoryIcon: '🎭',
            dateTime: 'Fri, 18 Dec 2026 • 7:30 PM IST',
            venue: 'Ranga Shankara, JP Nagar',
            city: 'Bengaluru',
            startingPrice: 699,
            totalSeats: 300,
            availableSeats: 260,
            image: '/assets/categories/theatre.jpg',
            organizer: 'The Playpen Collective',
            description: 'An award-winning intimate physical theatre performance tackling modern existentialism, urban solitude, and human connection in the digital age.'
        }
    ];

    // 8 Realistic Curated Indian Rental Venues (Across all 6 Venue Categories)
    const SAMPLE_VENUES = [
        {
            id: 'ven-101',
            name: 'The Monarch Crystal Ballroom',
            category: 'Banquet Halls',
            categorySlug: 'banquet-halls',
            categoryBadgeClass: 'badge-banquet',
            categoryIcon: '🏰',
            location: 'Jubilee Hills, Hyderabad',
            city: 'Hyderabad',
            capacity: '600 Guests',
            baseRental: 65000,
            image: '/assets/venue-banquet-hall.svg',
            suitableFor: 'Weddings, Corporate Receptions, Gala Dinners',
            amenities: ['Grand Crystal Chandeliers', 'Bridal Suites', 'Bespoke Buffet Kitchen', '250 Valet Slots']
        },
        {
            id: 'ven-102',
            name: 'Taj Lands End Grand Ballroom',
            category: 'Banquet Halls',
            categorySlug: 'banquet-halls',
            categoryBadgeClass: 'badge-banquet',
            categoryIcon: '🏰',
            location: 'Bandstand, Bandra West, Mumbai',
            city: 'Mumbai',
            capacity: '750 Guests',
            baseRental: 95000,
            image: '/assets/venue-banquet-hall.svg',
            suitableFor: 'Celebrity Galas, Luxury Banquets, Milestone Celebrations',
            amenities: ['Sea View Lawns Access', 'High-Ceiling Acoustics', 'Five-Star Catering', 'VIP Portico']
        },
        {
            id: 'ven-201',
            name: 'The Grand Imperial Auditorium',
            category: 'Auditoriums',
            categorySlug: 'auditoriums',
            categoryBadgeClass: 'badge-auditorium',
            categoryIcon: '🎭',
            location: 'Connaught Place, New Delhi',
            city: 'New Delhi',
            capacity: '1,500 Guests',
            baseRental: 75000,
            image: '/assets/venue-grand-auditorium.svg',
            suitableFor: 'Keynote Conclaves, Award Shows, Stage Plays',
            amenities: ['Acoustic Paneling', '4K Laser Projection', 'VIP Green Rooms', '3-Phase Power']
        },
        {
            id: 'ven-202',
            name: 'Sir Mutha Concert & Cultural Hall',
            category: 'Auditoriums',
            categorySlug: 'auditoriums',
            categoryBadgeClass: 'badge-auditorium',
            categoryIcon: '🎭',
            location: 'Chetpet, Chennai',
            city: 'Chennai',
            capacity: '1,200 Guests',
            baseRental: 60000,
            image: '/assets/venue-grand-auditorium.svg',
            suitableFor: 'Classical Concerts, Corporate Convocations, Theatre',
            amenities: ['Symphony Orchestra Pit', 'Yamaha Audio System', 'Dual Green Rooms', 'Central Air Conditioning']
        },
        {
            id: 'ven-301',
            name: 'Apex Executive Conference Centre',
            category: 'Conference Centres',
            categorySlug: 'conference-centres',
            categoryBadgeClass: 'badge-conference-centre',
            categoryIcon: '💼',
            location: 'Senapati Bapat Road, Pune',
            city: 'Pune',
            capacity: '350 Guests',
            baseRental: 40000,
            image: '/assets/venue-conference-centre.svg',
            suitableFor: 'Board Meetings, Executive Summits, Tech Hackathons',
            amenities: ['Hybrid AV Conclave Setup', '1 Gbps Fiber Wi-Fi', 'Four Breakout Pods', 'Ergonomic Seating']
        },
        {
            id: 'ven-401',
            name: 'Silicon Vista Convention Centre',
            category: 'Convention Halls',
            categorySlug: 'convention-halls',
            categoryBadgeClass: 'badge-convention',
            categoryIcon: '🌐',
            location: 'Whitefield, Bengaluru',
            city: 'Bengaluru',
            capacity: '2,500 Guests',
            baseRental: 120000,
            image: '/assets/venue-tech-convention.svg',
            suitableFor: 'Tech Hackathons, Product Launches, Trade Expos',
            amenities: ['Gigabit Fiber Wi-Fi', 'Modular Walls', 'Freight Elevator', 'Banquet Kitchen']
        },
        {
            id: 'ven-402',
            name: 'Pragati Mega Conclave Expo Centre',
            category: 'Convention Halls',
            categorySlug: 'convention-halls',
            categoryBadgeClass: 'badge-convention',
            categoryIcon: '🌐',
            location: 'Mathura Road, New Delhi',
            city: 'New Delhi',
            capacity: '5,000 Guests',
            baseRental: 200000,
            image: '/assets/venue-tech-convention.svg',
            suitableFor: 'Mega International Expos, Tech Summits, Auto Exhibitions',
            amenities: ['Heavy Industrial Power', 'Direct Metro Subway Link', 'Truck Loading Bays', '40,000 Sq.Ft Bay']
        },
        {
            id: 'ven-501',
            name: 'Royal Bay Amphitheatre & Lawns',
            category: 'Outdoor Lawns',
            categorySlug: 'outdoor-lawns',
            categoryBadgeClass: 'badge-lawn',
            categoryIcon: '🌿',
            location: 'Bandra West, Mumbai',
            city: 'Mumbai',
            capacity: '800 Guests',
            baseRental: 55000,
            image: '/assets/venue-heritage-lawn.svg',
            suitableFor: 'Music Concerts, Wedding Receptions, Cultural Evenings',
            amenities: ['Ocean-Breeze Stage', 'Fairy Light Truss', 'Banquet Lawn', '200+ Valet Parking']
        },
        {
            id: 'ven-601',
            name: 'Marina Bay Rooftop & Party Lounge',
            category: 'Party Venues',
            categorySlug: 'party-venues',
            categoryBadgeClass: 'badge-party',
            categoryIcon: '🎉',
            location: 'ECR Coastal Road, Chennai',
            city: 'Chennai',
            capacity: '250 Guests',
            baseRental: 45000,
            image: '/assets/venue-party-venue.svg',
            suitableFor: 'Cocktail Galas, DJ Evenings, Product Afterparties',
            amenities: ['Illuminated Dancefloor', 'Coastal Skyline Bar', 'Bass Rig Sound', 'Laser Lighting']
        }
    ];

    /**
     * Authoritative Asset Registry & Consistency Resolvers
     * Maps supplied local photographic media to event categories and vector SVGs to venue categories.
     * Guarantees 100% visual consistency across cards, modals, category landing pages, and backend responses.
     */
    const ASSET_REGISTRY = {
        events: {
            music: [
                '/assets/categories/music-concert.jpg',
                '/assets/categories/music.jpg'
            ],
            technology: '/assets/categories/technology.jpg',
            workshops: '/assets/categories/workshop.jpeg',
            sports: '/assets/categories/sports.jpeg',
            conferences: '/assets/categories/conference.jpeg',
            theatre: '/assets/categories/theatre.jpg'
        },
        venues: {
            'banquet-halls': '/assets/venue-banquet-hall.svg',
            'auditoriums': '/assets/venue-grand-auditorium.svg',
            'conference-centres': '/assets/venue-conference-centre.svg',
            'convention-halls': '/assets/venue-tech-convention.svg',
            'outdoor-lawns': '/assets/venue-heritage-lawn.svg',
            'party-venues': '/assets/venue-party-venue.svg'
        }
    };

    /**
     * Resolve photographic asset for an event category
     */
    function resolveCategoryImage(cat) {
        if (!cat) return ASSET_REGISTRY.events.music[0];
        const key = (cat.slug || cat.key || cat.title || '').toLowerCase();
        if (key.includes('music')) return ASSET_REGISTRY.events.music[0];
        if (key.includes('tech')) return ASSET_REGISTRY.events.technology;
        if (key.includes('workshop')) return ASSET_REGISTRY.events.workshops;
        if (key.includes('sport')) return ASSET_REGISTRY.events.sports;
        if (key.includes('conference')) return ASSET_REGISTRY.events.conferences;
        if (key.includes('theatr')) return ASSET_REGISTRY.events.theatre;
        if (cat.image && cat.image.includes('/assets/categories/')) return cat.image;
        return ASSET_REGISTRY.events.music[0];
    }

    /**
     * Resolve photographic asset for an event, distributing multiple images where available (Music)
     */
    function resolveEventImage(event) {
        if (!event) return ASSET_REGISTRY.events.music[0];
        const cat = (event.categorySlug || event.category || '').toLowerCase();
        const id = (event.id || event.code || '').toLowerCase();
        const title = (event.title || '').toLowerCase();
        const currentImg = event.image || '';

        if (cat.includes('music')) {
            // Distribute between music-concert.jpg and music.jpg
            if (id.includes('music-2') || id.includes('music-002') || title.includes('sufi') || currentImg.endsWith('music.jpg')) {
                return ASSET_REGISTRY.events.music[1];
            }
            return ASSET_REGISTRY.events.music[0];
        }

        if (cat.includes('tech')) return ASSET_REGISTRY.events.technology;
        if (cat.includes('workshop')) return ASSET_REGISTRY.events.workshops;
        if (cat.includes('sport')) return ASSET_REGISTRY.events.sports;
        if (cat.includes('conference')) return ASSET_REGISTRY.events.conferences;
        if (cat.includes('theatr')) return ASSET_REGISTRY.events.theatre;

        if (currentImg && currentImg.includes('/assets/categories/')) {
            return currentImg;
        }
        return ASSET_REGISTRY.events.music[0];
    }

    /**
     * Resolve vector illustration asset for a venue category or venue listing
     */
    function resolveVenueImage(venue) {
        if (!venue) return ASSET_REGISTRY.venues['convention-halls'];
        const cat = (venue.categorySlug || venue.category || venue.slug || venue.key || '').toLowerCase();
        if (cat.includes('banquet')) return ASSET_REGISTRY.venues['banquet-halls'];
        if (cat.includes('auditorium')) return ASSET_REGISTRY.venues['auditoriums'];
        if (cat.includes('conference')) return ASSET_REGISTRY.venues['conference-centres'];
        if (cat.includes('convention')) return ASSET_REGISTRY.venues['convention-halls'];
        if (cat.includes('lawn')) return ASSET_REGISTRY.venues['outdoor-lawns'];
        if (cat.includes('party')) return ASSET_REGISTRY.venues['party-venues'];

        if (venue.image && venue.image.startsWith('/assets/venue-')) {
            return venue.image;
        }
        return ASSET_REGISTRY.venues['convention-halls'];
    }

    /**
     * Authoritative Category Icon & Badge Registry
     * Provides clean, guaranteed-safe emoji icons and visual badge styles.
     * Prevents database character-encoding corruption (e.g. ASCII '?')
     * or missing icon mappings from displaying question marks to visitors.
     */
    const CATEGORY_ICON_REGISTRY = {
        events: {
            music: { icon: '🎵', badgeClass: 'badge-music' },
            technology: { icon: '💻', badgeClass: 'badge-tech' },
            workshops: { icon: '🛠️', badgeClass: 'badge-workshops' },
            sports: { icon: '🏆', badgeClass: 'badge-sports' },
            conferences: { icon: '🎤', badgeClass: 'badge-conferences' },
            theatre: { icon: '🎭', badgeClass: 'badge-theatre' }
        },
        venues: {
            'banquet-halls': { icon: '🏰', badgeClass: 'badge-banquet' },
            'auditoriums': { icon: '🎭', badgeClass: 'badge-auditorium' },
            'conference-centres': { icon: '💼', badgeClass: 'badge-conference-centre' },
            'convention-halls': { icon: '🌐', badgeClass: 'badge-convention' },
            'outdoor-lawns': { icon: '🌿', badgeClass: 'badge-lawn' },
            'party-venues': { icon: '🎉', badgeClass: 'badge-party' }
        }
    };

    /**
     * Tests whether an icon string is clean and safe to display.
     * Rejects placeholder question marks ('?'), Unicode replacement characters,
     * null, undefined, or empty values.
     */
    function isCleanIcon(icon) {
        if (!icon || typeof icon !== 'string') return false;
        const trimmed = icon.trim();
        if (!trimmed) return false;
        if (trimmed.includes('?') || trimmed.includes('\uFFFD') || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined') {
            return false;
        }
        return true;
    }

    /**
     * Resolve a clean event category emoji icon.
     * Guarantees that raw '?', 'undefined', or 'null' is never returned.
     */
    function resolveEventIcon(item) {
        if (!item) return '🎟️';
        const candidate = item.categoryIcon || item.icon;
        if (isCleanIcon(candidate)) {
            return candidate.trim();
        }
        const slug = (item.slug || item.categorySlug || '').toLowerCase();
        if (slug && CATEGORY_ICON_REGISTRY.events[slug]) {
            return CATEGORY_ICON_REGISTRY.events[slug].icon;
        }
        const str = `${item.categorySlug || ''} ${item.category || ''} ${item.slug || ''} ${item.key || ''} ${item.title || ''}`.toLowerCase();
        if (str.includes('theatr')) return CATEGORY_ICON_REGISTRY.events.theatre.icon;
        if (str.includes('music')) return CATEGORY_ICON_REGISTRY.events.music.icon;
        if (str.includes('tech')) return CATEGORY_ICON_REGISTRY.events.technology.icon;
        if (str.includes('workshop')) return CATEGORY_ICON_REGISTRY.events.workshops.icon;
        if (str.includes('sport')) return CATEGORY_ICON_REGISTRY.events.sports.icon;
        if (str.includes('conference')) return CATEGORY_ICON_REGISTRY.events.conferences.icon;
        return '🎟️';
    }

    /**
     * Resolve a valid event category CSS badge class.
     */
    function resolveEventBadgeClass(item) {
        if (!item) return 'badge-music';
        const candidate = item.categoryBadgeClass || item.badgeClass;
        if (candidate && typeof candidate === 'string' && candidate.startsWith('badge-')) {
            return candidate.trim();
        }
        const slug = (item.slug || item.categorySlug || '').toLowerCase();
        if (slug && CATEGORY_ICON_REGISTRY.events[slug]) {
            return CATEGORY_ICON_REGISTRY.events[slug].badgeClass;
        }
        const str = `${item.categorySlug || ''} ${item.category || ''} ${item.slug || ''} ${item.key || ''} ${item.title || ''}`.toLowerCase();
        if (str.includes('theatr')) return CATEGORY_ICON_REGISTRY.events.theatre.badgeClass;
        if (str.includes('music')) return CATEGORY_ICON_REGISTRY.events.music.badgeClass;
        if (str.includes('tech')) return CATEGORY_ICON_REGISTRY.events.technology.badgeClass;
        if (str.includes('workshop')) return CATEGORY_ICON_REGISTRY.events.workshops.badgeClass;
        if (str.includes('sport')) return CATEGORY_ICON_REGISTRY.events.sports.badgeClass;
        if (str.includes('conference')) return CATEGORY_ICON_REGISTRY.events.conferences.badgeClass;
        return 'badge-music';
    }

    /**
     * Resolve a clean venue category emoji icon.
     * Guarantees that raw '?', 'undefined', or 'null' is never returned.
     */
    function resolveVenueIcon(item) {
        if (!item) return '🏛️';
        const candidate = item.categoryIcon || item.icon;
        if (isCleanIcon(candidate)) {
            return candidate.trim();
        }
        const slug = (item.slug || item.categorySlug || '').toLowerCase();
        if (slug && CATEGORY_ICON_REGISTRY.venues[slug]) {
            return CATEGORY_ICON_REGISTRY.venues[slug].icon;
        }
        const str = `${item.categorySlug || ''} ${item.category || ''} ${item.slug || ''} ${item.key || ''} ${item.title || ''}`.toLowerCase();
        if (str.includes('banquet')) return CATEGORY_ICON_REGISTRY.venues['banquet-halls'].icon;
        if (str.includes('auditorium')) return CATEGORY_ICON_REGISTRY.venues['auditoriums'].icon;
        if (str.includes('conference')) return CATEGORY_ICON_REGISTRY.venues['conference-centres'].icon;
        if (str.includes('convention')) return CATEGORY_ICON_REGISTRY.venues['convention-halls'].icon;
        if (str.includes('lawn')) return CATEGORY_ICON_REGISTRY.venues['outdoor-lawns'].icon;
        if (str.includes('party')) return CATEGORY_ICON_REGISTRY.venues['party-venues'].icon;
        return '🏛️';
    }

    /**
     * Resolve a valid venue category CSS badge class.
     */
    function resolveVenueBadgeClass(item) {
        if (!item) return 'badge-auditorium';
        const candidate = item.categoryBadgeClass || item.badgeClass;
        if (candidate && typeof candidate === 'string' && candidate.startsWith('badge-')) {
            return candidate.trim();
        }
        const slug = (item.slug || item.categorySlug || '').toLowerCase();
        if (slug && CATEGORY_ICON_REGISTRY.venues[slug]) {
            return CATEGORY_ICON_REGISTRY.venues[slug].badgeClass;
        }
        const str = `${item.categorySlug || ''} ${item.category || ''} ${item.slug || ''} ${item.key || ''} ${item.title || ''}`.toLowerCase();
        if (str.includes('banquet')) return CATEGORY_ICON_REGISTRY.venues['banquet-halls'].badgeClass;
        if (str.includes('auditorium')) return CATEGORY_ICON_REGISTRY.venues['auditoriums'].badgeClass;
        if (str.includes('conference')) return CATEGORY_ICON_REGISTRY.venues['conference-centres'].badgeClass;
        if (str.includes('convention')) return CATEGORY_ICON_REGISTRY.venues['convention-halls'].badgeClass;
        if (str.includes('lawn')) return CATEGORY_ICON_REGISTRY.venues['outdoor-lawns'].badgeClass;
        if (str.includes('party')) return CATEGORY_ICON_REGISTRY.venues['party-venues'].badgeClass;
        return 'badge-auditorium';
    }

    /**
     * Generate visual availability badge markup based on current inventory
     */
    function getInventoryBadgeHtml(availableSeats, totalSeats) {
        if (availableSeats === undefined || availableSeats === null) {
            return `
                <div class="event-inventory-row">
                    <span class="inventory-pill inventory-available">
                        <span class="inventory-pill-dot" aria-hidden="true"></span>
                        <span class="inventory-text">Tickets Available</span>
                    </span>
                </div>
            `;
        }

        const count = parseInt(availableSeats, 10);
        if (count <= 0) {
            return `
                <div class="event-inventory-row">
                    <span class="inventory-pill inventory-sold-out">
                        <span class="inventory-pill-dot" aria-hidden="true"></span>
                        <span class="inventory-text">Sold Out</span>
                    </span>
                </div>
            `;
        }

        if (count <= 50) {
            return `
                <div class="event-inventory-row">
                    <span class="inventory-pill inventory-low">
                        <span class="inventory-pill-dot" aria-hidden="true"></span>
                        <span class="inventory-text">Only ${count} seat${count === 1 ? '' : 's'} left</span>
                    </span>
                </div>
            `;
        }

        return `
            <div class="event-inventory-row">
                <span class="inventory-pill inventory-available">
                    <span class="inventory-pill-dot" aria-hidden="true"></span>
                    <span class="inventory-text">${count} seats available</span>
                </span>
            </div>
        `;
    }

    /**
     * Update modal availability indicator and booking form controls
     */
    function updateModalAvailability(event) {
        if (!event) return;
        const count = (event.availableSeats !== undefined && event.availableSeats !== null)
            ? parseInt(event.availableSeats, 10)
            : null;
        const seatsEl = dom.modalEventSeats || document.getElementById('modal-event-seats');
        const soldOutAlert = dom.modalBookingSoldOutAlert || document.getElementById('modal-booking-sold-out-alert');
        const bookingForm = dom.eventBookingForm || document.getElementById('event-booking-form');
        const submitBtn = dom.btnModalBook || document.getElementById('btn-modal-book');

        if (seatsEl) {
            if (count === null) {
                seatsEl.innerHTML = `
                    <span class="inventory-pill inventory-available">
                        <span class="inventory-pill-dot" aria-hidden="true"></span>
                        <span class="inventory-text">Tickets Available</span>
                    </span>
                `;
            } else if (count <= 0) {
                seatsEl.innerHTML = `
                    <span class="inventory-pill inventory-sold-out">
                        <span class="inventory-pill-dot" aria-hidden="true"></span>
                        <span class="inventory-text">Sold Out</span>
                    </span>
                `;
            } else if (count <= 50) {
                seatsEl.innerHTML = `
                    <span class="inventory-pill inventory-low">
                        <span class="inventory-pill-dot" aria-hidden="true"></span>
                        <span class="inventory-text">Only ${count} seat${count === 1 ? '' : 's'} left</span>
                    </span>
                `;
            } else {
                seatsEl.innerHTML = `
                    <span class="inventory-pill inventory-available">
                        <span class="inventory-pill-dot" aria-hidden="true"></span>
                        <span class="inventory-text">${count} seats available</span>
                    </span>
                `;
            }
        }

        if (count !== null && count <= 0) {
            if (soldOutAlert) soldOutAlert.style.display = 'flex';
            if (bookingForm) {
                bookingForm.style.opacity = '0.55';
                bookingForm.querySelectorAll('input, select').forEach(el => el.disabled = true);
            }
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>Sold Out</span>';
            }
        } else {
            if (soldOutAlert) soldOutAlert.style.display = 'none';
            if (bookingForm) {
                bookingForm.style.opacity = '1';
                bookingForm.querySelectorAll('input, select').forEach(el => el.disabled = false);
            }
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>Confirm Ticket Pass</span>';
            }
        }
    }

    // Reactive application state
    const state = {
        theme: 'dark',
        currentPath: '/',
        currentRoute: 'home',
        activeEventCategory: '',
        eventSearchQuery: '',
        activeVenueCategory: '',
        activeVenueCity: '',
        venueSearchQuery: '',
        selectedEvent: null,
        selectedVenue: null,
        // Backend integration state
        currentUser: null,
        postLoginRedirect: null,
        myBookings: [],
        myInquiries: [],
        myBookingsLoading: false,
        myInquiriesLoading: false,
        eventCategories: [],
        venueCategories: [],
        venueCities: [],
        categoriesLoading: false,
        eventsData: [],
        venuesData: [],
        eventsLoading: false,
        venuesLoading: false,
        authMode: 'login'
    };

    // Cached DOM elements
    const dom = {};

    /**
     * Cache all interactive DOM nodes
     */
    function cacheDom() {
        // Theme Toggle & Logos
        dom.themeToggleBtn = document.getElementById('theme-toggle-btn');
        dom.navbarBrandLogo = document.getElementById('navbar-brand-logo');
        dom.footerBrandLogo = document.getElementById('footer-brand-logo');

        // Navigation elements
        dom.mainNav = document.getElementById('main-nav');
        dom.navLinks = document.getElementById('nav-links');
        dom.mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        dom.headerNavWrapper = document.getElementById('header-nav-wrapper');
        dom.brandLogoLink = document.getElementById('brand-logo-link');
        dom.headerActions = document.querySelector('.header-actions');
        dom.btnLogin = document.getElementById('btn-login');
        dom.btnRegister = document.getElementById('btn-register');

        // Route Views
        dom.viewHome = document.getElementById('view-home');
        dom.viewEventsCategories = document.getElementById('view-events-categories');
        dom.viewEvents = document.getElementById('view-events');
        dom.viewVenuesCategories = document.getElementById('view-venues-categories');
        dom.viewVenues = document.getElementById('view-venues');
        dom.viewNotFound = document.getElementById('view-not-found');
        dom.viewMyBookings = document.getElementById('view-my-bookings');
        dom.viewMyProfile = document.getElementById('view-my-profile');
        dom.viewAccountSettings = document.getElementById('view-account-settings');

        // Aliases for any backward-compatible checks
        dom.viewEventsAll = dom.viewEvents;
        dom.viewEventCategoryDetail = dom.viewEvents;
        dom.viewVenuesAll = dom.viewVenues;
        dom.viewVenueCategoryDetail = dom.viewVenues;

        dom.views = [
            dom.viewHome,
            dom.viewEventsCategories,
            dom.viewEvents,
            dom.viewVenuesCategories,
            dom.viewVenues,
            dom.viewNotFound,
            dom.viewMyBookings,
            dom.viewMyProfile,
            dom.viewAccountSettings
        ].filter(Boolean);

        // Account Details Modal
        dom.accountDetailsModal = document.getElementById('account-details-modal-backdrop');
        dom.accountDetailsModalCloseBtn = document.getElementById('account-details-modal-close-btn');
        dom.accountDetailsModalBody = document.getElementById('account-details-modal-body');

        // My Bookings Tabs & Elements
        dom.tabBtnTickets = document.getElementById('tab-btn-tickets');
        dom.tabBtnInquiries = document.getElementById('tab-btn-inquiries');
        dom.badgeTicketsCount = document.getElementById('badge-tickets-count');
        dom.badgeInquiriesCount = document.getElementById('badge-inquiries-count');
        dom.paneMyTickets = document.getElementById('pane-my-tickets');
        dom.paneMyInquiries = document.getElementById('pane-my-inquiries');
        dom.myTicketsLoading = document.getElementById('my-tickets-loading');
        dom.myInquiriesLoading = document.getElementById('my-inquiries-loading');
        dom.myTicketsError = document.getElementById('my-tickets-error');
        dom.myInquiriesError = document.getElementById('my-inquiries-error');
        dom.myTicketsEmpty = document.getElementById('my-tickets-empty');
        dom.myInquiriesEmpty = document.getElementById('my-inquiries-empty');
        dom.myTicketsList = document.getElementById('my-tickets-list');
        dom.myInquiriesList = document.getElementById('my-inquiries-list');
        dom.btnRetryTickets = document.getElementById('btn-retry-tickets');
        dom.btnRetryInquiries = document.getElementById('btn-retry-inquiries');

        // Experience 2A: Events Categories Landing Page DOM
        dom.eventsFullCategoriesGrid = document.getElementById('events-full-categories-grid');

        // Experience 2B: Explore Events DOM
        dom.eventsCompactNav = document.getElementById('events-compact-nav');
        dom.eventsBreadcrumbs = document.getElementById('events-breadcrumbs');
        dom.eventsBreadcrumbActive = document.getElementById('events-breadcrumb-active');
        dom.eventsHeadingTag = document.getElementById('events-heading-tag');
        dom.eventsHeadingTitle = document.getElementById('events-heading-title');
        dom.eventsHeadingSubtitle = document.getElementById('events-heading-subtitle');
        dom.eventsResultsCount = document.getElementById('events-results-count');
        dom.btnEventsReset = document.getElementById('btn-events-reset');
        dom.eventsSearchQuery = document.getElementById('events-search-query');
        dom.eventsCategorySelect = document.getElementById('events-category-select');
        dom.btnEventsSearchTrigger = document.getElementById('btn-events-search-trigger');
        dom.eventsGrid = document.getElementById('events-grid');
        dom.eventsEmptyState = document.getElementById('events-empty-state');
        dom.eventsEmptyMsg = document.getElementById('events-empty-msg');
        dom.btnEventsEmptyReset = document.getElementById('btn-events-empty-reset');

        // Aliases for event search & grid
        dom.allEventsHeading = dom.eventsHeadingTitle;
        dom.allEventsSubheading = dom.eventsHeadingSubtitle;
        dom.allEventsTag = dom.eventsHeadingTag;
        dom.allEventsSearchQuery = dom.eventsSearchQuery;
        dom.allEventsCategorySelect = dom.eventsCategorySelect;
        dom.btnAllEventsSearchTrigger = dom.btnEventsSearchTrigger;
        dom.allEventsResultsCount = dom.eventsResultsCount;
        dom.btnAllEventsReset = dom.btnEventsReset;
        dom.allEventsGrid = dom.eventsGrid;
        dom.allEventsEmptyState = dom.eventsEmptyState;
        dom.allEventsEmptyMsg = dom.eventsEmptyMsg;
        dom.btnAllEventsEmptyReset = dom.btnEventsEmptyReset;

        // Experience 3A: Venue Categories Landing Page DOM
        dom.venuesFullCategoriesGrid = document.getElementById('venues-full-categories-grid');

        // Experience 3B: Explore Venues DOM
        dom.venuesCompactNav = document.getElementById('venues-compact-nav');
        dom.venuesBreadcrumbs = document.getElementById('venues-breadcrumbs');
        dom.venuesBreadcrumbActive = document.getElementById('venues-breadcrumb-active');
        dom.venuesHeadingTag = document.getElementById('venues-heading-tag');
        dom.venuesHeadingTitle = document.getElementById('venues-heading-title');
        dom.venuesHeadingSubtitle = document.getElementById('venues-heading-subtitle');
        dom.venuesResultsCount = document.getElementById('venues-results-count');
        dom.btnVenuesReset = document.getElementById('btn-venues-reset');
        dom.venuesCategorySelect = document.getElementById('venues-category-select');
        dom.venuesCitySelect = document.getElementById('venues-city-select');
        dom.venuesSearchInput = document.getElementById('venues-search-input');
        dom.btnVenuesApply = document.getElementById('btn-venues-apply');
        dom.venuesGrid = document.getElementById('venues-grid');
        dom.venuesEmptyState = document.getElementById('venues-empty-state');
        dom.venuesEmptyMsg = document.getElementById('venues-empty-msg');
        dom.btnVenuesEmptyReset = document.getElementById('btn-venues-empty-reset');

        // Aliases for venue search & grid
        dom.allVenuesHeading = dom.venuesHeadingTitle;
        dom.allVenuesSubheading = dom.venuesHeadingSubtitle;
        dom.allVenuesTag = dom.venuesHeadingTag;
        dom.allVenuesCategorySelect = dom.venuesCategorySelect;
        dom.allVenuesCitySelect = dom.venuesCitySelect;
        dom.allVenuesSearchInput = dom.venuesSearchInput;
        dom.btnAllVenuesApply = dom.btnVenuesApply;
        dom.allVenuesResultsCount = dom.venuesResultsCount;
        dom.btnAllVenuesResetBtn = dom.btnVenuesReset;
        dom.allVenuesGrid = dom.venuesGrid;
        dom.allVenuesEmptyState = dom.venuesEmptyState;
        dom.allVenuesEmptyMsg = dom.venuesEmptyMsg;
        dom.btnAllVenuesEmptyReset = dom.btnVenuesEmptyReset;

        // Event Modal
        dom.eventModal = document.getElementById('event-modal-backdrop');
        dom.modalCloseBtn = document.getElementById('modal-close-btn');
        dom.modalCloseAction = document.getElementById('modal-close-action');
        dom.modalEventImage = document.getElementById('modal-event-image');
        dom.modalEventCategory = document.getElementById('modal-event-category');
        dom.modalEventTitle = document.getElementById('modal-event-title');
        dom.modalEventDate = document.getElementById('modal-event-date');
        dom.modalEventVenue = document.getElementById('modal-event-venue');
        dom.modalEventPrice = document.getElementById('modal-event-price');
        dom.modalEventOrganizer = document.getElementById('modal-event-organizer');
        dom.modalEventSeats = document.getElementById('modal-event-seats');
        dom.modalEventDescription = document.getElementById('modal-event-description');
        dom.btnModalBook = document.getElementById('btn-modal-book');
        dom.eventBookingSection = document.getElementById('event-booking-section');
        dom.eventBookingForm = document.getElementById('event-booking-form');
        dom.modalBookingSoldOutAlert = document.getElementById('modal-booking-sold-out-alert');
        dom.eventBookingConfirmation = document.getElementById('event-booking-confirmation');
        dom.bookingTicketTier = document.getElementById('booking-ticket-tier');
        dom.bookingQuantity = document.getElementById('booking-quantity');
        dom.bookingTotalDisplay = document.getElementById('booking-total-display');
        dom.bookingName = document.getElementById('booking-name');
        dom.bookingEmail = document.getElementById('booking-email');
        dom.bookingPhone = document.getElementById('booking-phone');
        dom.btnBookingAnother = document.getElementById('btn-booking-another');
        dom.btnBookingDone = document.getElementById('btn-booking-done');

        // Venue Rental Modal
        dom.venueModal = document.getElementById('venue-modal-backdrop');
        dom.venueModalCloseBtn = document.getElementById('venue-modal-close-btn');
        dom.venueModalCloseAction = document.getElementById('venue-modal-close-action');
        dom.venueModalImage = document.getElementById('venue-modal-image');
        dom.venueModalBadge = document.getElementById('venue-modal-badge');
        dom.venueModalTitle = document.getElementById('venue-modal-title');
        dom.venueModalLocation = document.getElementById('venue-modal-location');
        dom.venueModalCapacity = document.getElementById('venue-modal-capacity');
        dom.venueModalPrice = document.getElementById('venue-modal-price');
        dom.venueInquiryForm = document.getElementById('venue-inquiry-form');
        dom.btnSubmitInquiry = document.getElementById('btn-submit-inquiry');
        dom.venueInquiryConfirmation = document.getElementById('venue-inquiry-confirmation');
        dom.btnInquiryAnother = document.getElementById('btn-inquiry-another');
        dom.btnInquiryDone = document.getElementById('btn-inquiry-done');

        // Auth Modal
        dom.authModal = document.getElementById('auth-modal-backdrop');
        dom.authModalCloseBtn = document.getElementById('auth-modal-close-btn');
        dom.authModalOkBtn = document.getElementById('auth-modal-ok-btn');
        dom.authTabLogin = document.getElementById('auth-tab-login');
        dom.authTabRegister = document.getElementById('auth-tab-register');
        dom.formAuthLogin = document.getElementById('form-auth-login');
        dom.formAuthRegister = document.getElementById('form-auth-register');
        dom.authErrorAlert = document.getElementById('auth-error-alert');
        dom.btnAuthQuickFill = document.getElementById('btn-auth-quick-fill');

        // Toast
        dom.toast = document.getElementById('toast');
        dom.toastMessage = document.getElementById('toast-message');
    }

    /**
     * Theme System Management
     */
    function initTheme() {
        let activeTheme = 'dark';
        try {
            const stored = localStorage.getItem(CONFIG.themeStorageKey);
            if (stored === 'light' || stored === 'dark') {
                activeTheme = stored;
            } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                activeTheme = 'light';
            }
        } catch (e) {
            console.warn('[VenueVista] Could not access localStorage for theme', e);
        }
        setTheme(activeTheme, false);

        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                const userStored = localStorage.getItem(CONFIG.themeStorageKey);
                if (!userStored) {
                    setTheme(e.matches ? 'dark' : 'light', false);
                }
            });
        }
    }

    function setTheme(themeName, persist = true) {
        state.theme = themeName;
        document.documentElement.setAttribute('data-theme', themeName);

        if (persist) {
            try {
                localStorage.setItem(CONFIG.themeStorageKey, themeName);
            } catch (e) {
                console.warn('[VenueVista] Could not persist theme preference', e);
            }
        }

        // Dynamically update authoritative brand logo to exact theme variant
        const logoSrc = themeName === 'dark' ? '/assets/logo-dark.png' : '/assets/logo-light.png';
        if (dom.navbarBrandLogo) {
            dom.navbarBrandLogo.src = logoSrc;
        } else {
            const nl = document.getElementById('navbar-brand-logo');
            if (nl) nl.src = logoSrc;
        }
        if (dom.footerBrandLogo) {
            dom.footerBrandLogo.src = logoSrc;
        } else {
            const fl = document.getElementById('footer-brand-logo');
            if (fl) fl.src = logoSrc;
        }

        if (dom.themeToggleBtn) {
            const isDark = themeName === 'dark';
            dom.themeToggleBtn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
            dom.themeToggleBtn.setAttribute('title', isDark ? 'Theme: Midnight Aurora (Click for Aurora Light)' : 'Theme: Aurora Light (Click for Midnight Aurora)');
        }
    }

    function toggleTheme() {
        const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme, true);
        const msg = nextTheme === 'dark' ? 'Mode switched to Midnight Glow' : 'Mode switched to Aurora View';
        showToast(msg);
    }

    /**
     * Client-Side Router using the History API (pushState & popstate)
     */
    function navigateTo(url) {
        if (!url) return;
        // Normalize comparison
        const currentFull = window.location.pathname + window.location.search + window.location.hash;
        if (currentFull === url) return;

        window.history.pushState(null, '', url);
        handleRoute();
    }

    function handleRoute() {
        // Read current pathname, query parameters and hash
        let rawPath = window.location.pathname || '/';
        const search = window.location.search || '';
        const hash = window.location.hash || '';

        // If app was loaded with a legacy hash route (e.g., /#/events/music), extract it
        if (hash.startsWith('#/')) {
            rawPath = hash.substring(1);
        }

        // Clean trailing slashes except for root
        let cleanPath = rawPath.replace(/\/+$/, '') || '/';
        state.currentPath = cleanPath;

        const queryParams = new URLSearchParams(search);

        // Resolve active route view
        let activeViewId = 'view-home';
        let navExperience = 'home';
        let documentTitle = 'VenueVista | Discover Events & Find Your Perfect Venue';

        // 1. Shared Homepage: / or /home
        if (cleanPath === '/' || cleanPath === '/home') {
            activeViewId = 'view-home';
            navExperience = 'home';
            state.currentRoute = 'home';
            documentTitle = 'VenueVista | Discover Events & Find Your Perfect Venue';
        }
        // 2. Event Categories Landing Page: /events/categories
        else if (cleanPath === '/events/categories') {
            activeViewId = 'view-events-categories';
            navExperience = 'events';
            state.currentRoute = 'events-categories';
            documentTitle = 'VenueVista | Browse Event Categories';
            renderEventsFullCategories();
        }
        // 3. Explore Events: /events or /events/all
        else if (cleanPath === '/events' || cleanPath === '/events/all') {
            activeViewId = 'view-events';
            navExperience = 'events';
            state.currentRoute = 'events-all';
            documentTitle = 'VenueVista | All Upcoming Events in India';

            const eventCats = (state.eventCategories && state.eventCategories.length) ? state.eventCategories : EVENT_CATEGORIES;
            const catParam = queryParams.get('category');
            if (catParam) {
                const matched = eventCats.find(c => c.key.toLowerCase() === catParam.toLowerCase() || c.slug === catParam.toLowerCase());
                renderExploreEventsListing(matched ? matched.slug : 'all');
            } else {
                renderExploreEventsListing('all');
            }
        }
        // 4. Individual Event Category Pages: /events/:categorySlug
        else if (cleanPath.startsWith('/events/')) {
            const eventCats = (state.eventCategories && state.eventCategories.length) ? state.eventCategories : EVENT_CATEGORIES;
            const catSlug = cleanPath.replace('/events/', '').toLowerCase();
            const matchedCat = eventCats.find(c => c.slug === catSlug);

            if (matchedCat) {
                activeViewId = 'view-events';
                navExperience = 'events';
                state.currentRoute = 'event-category';
                documentTitle = `VenueVista | ${matchedCat.title} in India`;
                renderExploreEventsListing(matchedCat.slug);
            } else {
                activeViewId = 'view-not-found';
                navExperience = 'home';
                state.currentRoute = 'not-found';
                documentTitle = 'VenueVista | Page Not Found';
            }
        }
        // 5. Venue Categories Landing Page: /venues/categories
        else if (cleanPath === '/venues/categories') {
            activeViewId = 'view-venues-categories';
            navExperience = 'venues';
            state.currentRoute = 'venues-categories';
            documentTitle = 'VenueVista | Browse Venue Categories';
            renderVenuesFullCategories();
        }
        // 6. Explore Venues: /venues or /venues/all
        else if (cleanPath === '/venues' || cleanPath === '/venues/all') {
            activeViewId = 'view-venues';
            navExperience = 'venues';
            state.currentRoute = 'venues-all';
            documentTitle = 'VenueVista | All Demonstration Venues in India';

            const venueCats = (state.venueCategories && state.venueCategories.length) ? state.venueCategories : VENUE_CATEGORIES;
            const venCatParam = queryParams.get('category');
            const venCityParam = queryParams.get('city');
            if (venCityParam) {
                state.activeVenueCity = venCityParam;
            }
            if (venCatParam) {
                const matchedV = venueCats.find(vc => vc.key.toLowerCase() === venCatParam.toLowerCase() || vc.slug === venCatParam.toLowerCase());
                renderExploreVenuesListing(matchedV ? matchedV.slug : 'all');
            } else {
                renderExploreVenuesListing('all');
            }
        }
        // 7. Individual Venue Category Pages: /venues/:venueCategorySlug
        else if (cleanPath.startsWith('/venues/')) {
            const venueCats = (state.venueCategories && state.venueCategories.length) ? state.venueCategories : VENUE_CATEGORIES;
            const venueCatSlug = cleanPath.replace('/venues/', '').toLowerCase();
            const matchedVenueCat = venueCats.find(vc => vc.slug === venueCatSlug);

            if (matchedVenueCat) {
                activeViewId = 'view-venues';
                navExperience = 'venues';
                state.currentRoute = 'venue-category';
                documentTitle = `VenueVista | ${matchedVenueCat.title} in India`;
                renderExploreVenuesListing(matchedVenueCat.slug);
            } else {
                activeViewId = 'view-not-found';
                navExperience = 'home';
                state.currentRoute = 'not-found';
                documentTitle = 'VenueVista | Page Not Found';
            }
        }
        // 8. My Bookings Route: /my-bookings
        else if (cleanPath === '/my-bookings') {
            if (!state.currentUser) {
                state.postLoginRedirect = cleanPath + (search || '');
                openAuthModal('login');
                showToast('Please sign in to access your bookings.');
                activeViewId = 'view-home';
                navExperience = 'home';
                state.currentRoute = 'home';
                documentTitle = 'VenueVista | Discover Events & Find Your Perfect Venue';
            } else {
                activeViewId = 'view-my-bookings';
                navExperience = 'account';
                state.currentRoute = 'my-bookings';
                documentTitle = 'VenueVista | My Bookings';
                renderMyBookingsPage(queryParams.get('tab'));
            }
        }
        // 9. My Profile Route: /my-profile
        else if (cleanPath === '/my-profile') {
            if (!state.currentUser) {
                state.postLoginRedirect = cleanPath + (search || '');
                openAuthModal('login');
                showToast('Please sign in to view your profile.');
                activeViewId = 'view-home';
                navExperience = 'home';
                state.currentRoute = 'home';
                documentTitle = 'VenueVista | Discover Events & Find Your Perfect Venue';
            } else {
                activeViewId = 'view-my-profile';
                navExperience = 'account';
                state.currentRoute = 'my-profile';
                documentTitle = 'VenueVista | My Profile';
                renderMyProfilePage();
            }
        }
        // 10. Account Settings Route: /account-settings
        else if (cleanPath === '/account-settings') {
            if (!state.currentUser) {
                state.postLoginRedirect = cleanPath + (search || '');
                openAuthModal('login');
                showToast('Please sign in to access account settings.');
                activeViewId = 'view-home';
                navExperience = 'home';
                state.currentRoute = 'home';
                documentTitle = 'VenueVista | Discover Events & Find Your Perfect Venue';
            } else {
                activeViewId = 'view-account-settings';
                navExperience = 'account';
                state.currentRoute = 'account-settings';
                documentTitle = 'VenueVista | Account Settings';
                renderAccountSettingsPage();
            }
        }
        // 11. Unknown Route: Not Found
        else {
            activeViewId = 'view-not-found';
            navExperience = 'home';
            state.currentRoute = 'not-found';
            documentTitle = 'VenueVista | Page Not Found';
        }

        // Update Document Title
        document.title = documentTitle;

        // Switch View Visibility
        dom.views.forEach(view => {
            if (view) {
                if (view.id === activeViewId) {
                    view.classList.add('active');
                } else {
                    view.classList.remove('active');
                }
            }
        });

        // Update Context-Specific Navigation Items
        updateHeaderNavigation(navExperience, cleanPath, hash);

        // Scroll Position Handling: Natural scrolling when changing pages or targeting in-page anchors
        if (hash && hash.length > 1 && !hash.startsWith('#/')) {
            const targetId = hash.substring(1);
            setTimeout(() => {
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth' });
                }
            }, 60);
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Close mobile navigation menu if open
        if (dom.headerNavWrapper) {
            dom.headerNavWrapper.classList.remove('is-open');
            if (dom.mobileMenuToggle) {
                dom.mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        }
    }

    /**
     * Context-Specific Navigation Bar Management
     */
    function updateHeaderNavigation(experience, path, hash) {
        if (!dom.navLinks) return;

        let navHtml = '';

        if (experience === 'events') {
            // Event Experience Navigation (Exact Order):
            // 1. Home
            // 2. Categories
            // 3. Explore Events
            // 4. How Explore Events Works
            const isCategoriesActive = path === '/events/categories';
            const isHowWorksActive = hash === '#how-events-work';
            const isExploreActive = !isCategoriesActive && !isHowWorksActive;

            navHtml = `
                <li><a href="/" class="nav-link" data-nav="home">Home</a></li>
                <li><a href="/events/categories" class="nav-link ${isCategoriesActive ? 'active' : ''}" data-nav="categories">Categories</a></li>
                <li><a href="/events/all" class="nav-link ${isExploreActive ? 'active' : ''}" data-nav="explore-events">Explore Events</a></li>
                <li><a href="/events#how-events-work" class="nav-link ${isHowWorksActive ? 'active' : ''}" data-nav="how-events-work">How Explore Events Works</a></li>
            `;
        } else if (experience === 'venues') {
            // Venue Experience Navigation (Exact Order):
            // 1. Home
            // 2. Categories
            // 3. Explore Venues
            // 4. How Finding a Venue Works
            const isVenueCatActive = path === '/venues/categories';
            const isHowVenueWorksActive = hash === '#how-venues-work';
            const isExploreVenuesActive = !isVenueCatActive && !isHowVenueWorksActive;

            navHtml = `
                <li><a href="/" class="nav-link" data-nav="home">Home</a></li>
                <li><a href="/venues/categories" class="nav-link ${isVenueCatActive ? 'active' : ''}" data-nav="venue-categories">Categories</a></li>
                <li><a href="/venues/all" class="nav-link ${isExploreVenuesActive ? 'active' : ''}" data-nav="explore-venues">Explore Venues</a></li>
                <li><a href="/venues#how-venues-work" class="nav-link ${isHowVenueWorksActive ? 'active' : ''}" data-nav="how-venues-work">How Finding a Venue Works</a></li>
            `;
        } else if (experience === 'account') {
            const isMyBookingsActive = path === '/my-bookings';
            navHtml = `
                <li><a href="/" class="nav-link" data-nav="home">Home</a></li>
                <li><a href="/events" class="nav-link" data-nav="events">Explore Events</a></li>
                <li><a href="/venues" class="nav-link" data-nav="venues">Find Venues</a></li>
                <li><a href="/my-bookings" class="nav-link ${isMyBookingsActive ? 'active' : ''}" data-nav="my-bookings">My Bookings</a></li>
            `;
        } else {
            // Homepage Navigation (Exact Order):
            // 1. Home
            // 2. Explore Events
            // 3. Find Venues
            // 4. How It Works
            const isHowItWorksActive = hash === '#how-it-works';
            const isHomeActive = (path === '/' || path === '/home') && !isHowItWorksActive;

            navHtml = `
                <li><a href="/" class="nav-link ${isHomeActive ? 'active' : ''}" data-nav="home">Home</a></li>
                <li><a href="/events" class="nav-link" data-nav="events">Explore Events</a></li>
                <li><a href="/venues" class="nav-link" data-nav="venues">Find Venues</a></li>
                <li><a href="/#how-it-works" class="nav-link ${isHowItWorksActive ? 'active' : ''}" data-nav="how-it-works">How It Works</a></li>
            `;
        }

        dom.navLinks.innerHTML = navHtml;
    }

    /**
     * Renderers for Event Views
     */

    // Full category cards directory on /events/categories
    function renderEventsFullCategories() {
        if (!dom.eventsFullCategoriesGrid) return;
        if (state.categoriesLoading) {
            dom.eventsFullCategoriesGrid.innerHTML = `
                <div class="api-loading-state" style="grid-column: 1 / -1;">
                    <div class="api-spinner"></div>
                    <p>Loading categories...</p>
                </div>
            `;
            return;
        }
        const cats = (state.eventCategories && state.eventCategories.length) ? state.eventCategories : EVENT_CATEGORIES;
        if (!cats || cats.length === 0) {
            dom.eventsFullCategoriesGrid.innerHTML = `
                <div class="api-error-state" style="grid-column: 1 / -1;">
                    <span class="error-icon" aria-hidden="true">⚠️</span>
                    <h3>Couldn't load categories</h3>
                    <p>Please try again.</p>
                    <button class="btn btn-primary btn-sm" id="btn-event-categories-retry" type="button">Try Again</button>
                </div>
            `;
            const retryBtn = document.getElementById('btn-event-categories-retry');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    loadCategoriesAndCities().then(() => renderEventsFullCategories());
                });
            }
            return;
        }
        dom.eventsFullCategoriesGrid.innerHTML = cats.map(cat => createCategoryCardHtml(cat)).join('');
    }

    // Explore Events Listing on /events, /events/all, /events/:categorySlug
    function renderExploreEventsListing(slug = 'all') {
        const isAll = !slug || slug === 'all';
        const cats = (state.eventCategories && state.eventCategories.length) ? state.eventCategories : EVENT_CATEGORIES;
        const matchedCat = isAll ? null : cats.find(c => c.slug === slug);

        // Update active category in state
        state.activeEventCategory = matchedCat ? (matchedCat.key || matchedCat.title) : '';

        // Update Compact Navigation Row Active Pill
        if (dom.eventsCompactNav) {
            dom.eventsCompactNav.querySelectorAll('.compact-cat-pill').forEach(pill => {
                const pillSlug = pill.dataset.slug || '';
                const isActive = (isAll && (pillSlug === 'all' || pillSlug === '')) || (matchedCat && pillSlug === matchedCat.slug);
                pill.classList.toggle('active', Boolean(isActive));
                pill.setAttribute('aria-current', isActive ? 'page' : 'false');
            });
        }

        // Update Breadcrumb
        if (dom.eventsBreadcrumbActive) {
            dom.eventsBreadcrumbActive.textContent = matchedCat ? matchedCat.title : 'All Events';
        }

        // Update Header Titles
        if (dom.eventsHeadingTitle && dom.eventsHeadingSubtitle) {
            if (matchedCat) {
                const icon = resolveEventIcon(matchedCat);
                if (dom.eventsHeadingTag) dom.eventsHeadingTag.textContent = `${icon} ${matchedCat.title}`;
                dom.eventsHeadingTitle.textContent = `${matchedCat.title} Events in India`;
                dom.eventsHeadingSubtitle.textContent = matchedCat.description;
            } else {
                if (dom.eventsHeadingTag) dom.eventsHeadingTag.textContent = 'Complete Catalog';
                dom.eventsHeadingTitle.textContent = 'All Upcoming Events in India';
                dom.eventsHeadingSubtitle.textContent = 'Browse live curated events across India. Search by title, venue, or metro city, and filter by category.';
            }
        }

        // Synchronize category select dropdown
        if (dom.eventsCategorySelect) {
            dom.eventsCategorySelect.value = state.activeEventCategory;
        }

        applyEventFilters();
    }

    // Complete catalog of all events with backend search and filters
    async function applyEventFilters() {
        const grid = dom.eventsGrid || dom.allEventsGrid;
        const emptyState = dom.eventsEmptyState || dom.allEventsEmptyState;
        if (!grid) return;

        if (emptyState) emptyState.style.display = 'none';
        grid.style.display = 'grid';
        grid.innerHTML = `
            <div class="api-loading-state">
                <div class="api-spinner"></div>
                <p>Loading events...</p>
            </div>
        `;

        try {
            state.eventsLoading = true;
            const queryParams = {};
            if (state.activeEventCategory) {
                queryParams.category = state.activeEventCategory;
            }
            if (state.eventSearchQuery) {
                queryParams.query = state.eventSearchQuery;
            }

            const res = await apiClient.get('/api/events', queryParams);
            const events = (res && res.data) ? res.data : [];
            events.forEach(e => {
                e.image = resolveEventImage(e);
                e.categoryIcon = resolveEventIcon(e);
                e.categoryBadgeClass = resolveEventBadgeClass(e);
            });
            state.eventsData = events;
            state.eventsLoading = false;

            renderEventsGrid(events);
            syncEventFilterControls(events.length);
        } catch (err) {
            state.eventsLoading = false;
            console.error('[VenueVista] Failed to fetch events:', err);
            grid.style.display = 'grid';
            if (emptyState) emptyState.style.display = 'none';
            grid.innerHTML = `
                <div class="api-error-state">
                    <span class="error-icon" aria-hidden="true">⚠️</span>
                    <h3>Couldn't load events</h3>
                    <p>Please try again.</p>
                    <button class="btn btn-primary btn-sm" id="btn-events-retry" type="button">Try Again</button>
                </div>
            `;
            const retryBtn = document.getElementById('btn-events-retry');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => applyEventFilters());
            }
        }
    }

    function renderEventsGrid(events) {
        const grid = dom.eventsGrid || dom.allEventsGrid;
        const emptyState = dom.eventsEmptyState || dom.allEventsEmptyState;
        if (!grid || !emptyState) return;

        if (events.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';

            let msg = "We couldn't find any events matching your criteria.";
            if (state.eventSearchQuery && state.activeEventCategory) {
                msg = `No events match "${state.eventSearchQuery}" in ${state.activeEventCategory}.`;
            } else if (state.eventSearchQuery) {
                msg = `No events match "${state.eventSearchQuery}".`;
            } else if (state.activeEventCategory) {
                msg = `No upcoming events found in ${state.activeEventCategory}.`;
            }
            const emptyMsgEl = dom.eventsEmptyMsg || dom.allEventsEmptyMsg;
            if (emptyMsgEl) emptyMsgEl.textContent = msg;
        } else {
            emptyState.style.display = 'none';
            grid.style.display = 'grid';
            grid.innerHTML = events.map(event => createEventCardHtml(event)).join('');
            attachEventCardListeners(grid);
        }
    }

    function syncEventFilterControls(matchCount) {
        const searchInput = dom.eventsSearchQuery || dom.allEventsSearchQuery;
        if (searchInput && searchInput.value !== state.eventSearchQuery) {
            searchInput.value = state.eventSearchQuery;
        }

        const catSelect = dom.eventsCategorySelect || dom.allEventsCategorySelect;
        if (catSelect) {
            catSelect.value = state.activeEventCategory;
        }

        const countEl = dom.eventsResultsCount || dom.allEventsResultsCount;
        if (countEl) {
            if (state.eventSearchQuery || state.activeEventCategory) {
                countEl.textContent = `Found ${matchCount} event${matchCount === 1 ? '' : 's'}`;
            } else {
                countEl.textContent = `Showing all ${matchCount} events`;
            }
        }

        const resetBtn = dom.btnEventsReset || dom.btnAllEventsReset;
        if (resetBtn) {
            const hasFilter = Boolean(state.eventSearchQuery || state.activeEventCategory);
            resetBtn.style.display = hasFilter ? 'inline-flex' : 'none';
        }
    }

    /**
     * Renderers for Venue Views
     */

    // Full category cards directory on /venues/categories
    function renderVenuesFullCategories() {
        if (!dom.venuesFullCategoriesGrid) return;
        if (state.categoriesLoading) {
            dom.venuesFullCategoriesGrid.innerHTML = `
                <div class="api-loading-state" style="grid-column: 1 / -1;">
                    <div class="api-spinner"></div>
                    <p>Loading categories...</p>
                </div>
            `;
            return;
        }
        const cats = (state.venueCategories && state.venueCategories.length) ? state.venueCategories : VENUE_CATEGORIES;
        if (!cats || cats.length === 0) {
            dom.venuesFullCategoriesGrid.innerHTML = `
                <div class="api-error-state" style="grid-column: 1 / -1;">
                    <span class="error-icon" aria-hidden="true">🏛️</span>
                    <h3>Couldn't load categories</h3>
                    <p>Please try again.</p>
                    <button class="btn btn-primary btn-sm" id="btn-venue-categories-retry" type="button">Try Again</button>
                </div>
            `;
            const retryBtn = document.getElementById('btn-venue-categories-retry');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    loadCategoriesAndCities().then(() => renderVenuesFullCategories());
                });
            }
            return;
        }
        dom.venuesFullCategoriesGrid.innerHTML = cats.map(vc => createVenueCategoryCardHtml(vc)).join('');
    }

    // Explore Venues Listing on /venues, /venues/all, /venues/:venueCategorySlug
    function renderExploreVenuesListing(slug = 'all') {
        const isAll = !slug || slug === 'all';
        const cats = (state.venueCategories && state.venueCategories.length) ? state.venueCategories : VENUE_CATEGORIES;
        const matchedVenueCat = isAll ? null : cats.find(vc => vc.slug === slug);

        // Update active venue category in state
        state.activeVenueCategory = matchedVenueCat ? (matchedVenueCat.key || matchedVenueCat.title) : '';

        // Update Compact Navigation Row Active Pill
        if (dom.venuesCompactNav) {
            dom.venuesCompactNav.querySelectorAll('.compact-cat-pill').forEach(pill => {
                const pillSlug = pill.dataset.slug || '';
                const isActive = (isAll && (pillSlug === 'all' || pillSlug === '')) || (matchedVenueCat && pillSlug === matchedVenueCat.slug);
                pill.classList.toggle('active', Boolean(isActive));
                pill.setAttribute('aria-current', isActive ? 'page' : 'false');
            });
        }

        // Update Breadcrumb
        if (dom.venuesBreadcrumbActive) {
            dom.venuesBreadcrumbActive.textContent = matchedVenueCat ? matchedVenueCat.title : 'All Venues';
        }

        // Update Header Titles
        if (dom.venuesHeadingTitle && dom.venuesHeadingSubtitle) {
            if (matchedVenueCat) {
                const icon = resolveVenueIcon(matchedVenueCat);
                if (dom.venuesHeadingTag) dom.venuesHeadingTag.textContent = `${icon} ${matchedVenueCat.title}`;
                dom.venuesHeadingTitle.textContent = `${matchedVenueCat.title} in India`;
                dom.venuesHeadingSubtitle.textContent = matchedVenueCat.description;
            } else {
                if (dom.venuesHeadingTag) dom.venuesHeadingTag.textContent = 'All Rental Spaces';
                dom.venuesHeadingTitle.textContent = 'All Venues in India';
                dom.venuesHeadingSubtitle.textContent = 'Certified event venues across New Delhi, Mumbai, Bengaluru, Hyderabad, Pune, and Chennai. Filter by venue type and location.';
            }
        }

        // Synchronize venue category select dropdown
        if (dom.venuesCategorySelect) {
            dom.venuesCategorySelect.value = state.activeVenueCategory;
        }

        applyVenueFilters();
    }

    // Complete catalog of all venues with backend search and filters
    async function applyVenueFilters() {
        const grid = dom.venuesGrid || dom.allVenuesGrid;
        const emptyState = dom.venuesEmptyState || dom.allVenuesEmptyState;
        if (!grid) return;

        if (emptyState) emptyState.style.display = 'none';
        grid.style.display = 'grid';
        grid.innerHTML = `
            <div class="api-loading-state">
                <div class="api-spinner"></div>
                <p>Loading venues...</p>
            </div>
        `;

        try {
            state.venuesLoading = true;
            const queryParams = {};
            if (state.activeVenueCategory) {
                queryParams.category = state.activeVenueCategory;
            }
            if (state.activeVenueCity) {
                queryParams.city = state.activeVenueCity;
            }
            if (state.venueSearchQuery) {
                queryParams.query = state.venueSearchQuery;
            }

            const res = await apiClient.get('/api/venues', queryParams);
            const venues = (res && res.data) ? res.data : [];
            venues.forEach(v => {
                v.image = resolveVenueImage(v);
                v.categoryIcon = resolveVenueIcon(v);
                v.categoryBadgeClass = resolveVenueBadgeClass(v);
            });
            state.venuesData = venues;
            state.venuesLoading = false;

            renderVenuesGrid(venues);
            syncVenueFilterControls(venues.length);
        } catch (err) {
            state.venuesLoading = false;
            console.error('[VenueVista] Failed to fetch venues:', err);
            grid.style.display = 'grid';
            if (emptyState) emptyState.style.display = 'none';
            grid.innerHTML = `
                <div class="api-error-state">
                    <span class="error-icon" aria-hidden="true">🏛️</span>
                    <h3>Couldn't load venues</h3>
                    <p>Please try again.</p>
                    <button class="btn btn-primary btn-sm" id="btn-venues-retry" type="button">Try Again</button>
                </div>
            `;
            const retryBtn = document.getElementById('btn-venues-retry');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => applyVenueFilters());
            }
        }
    }

    function renderVenuesGrid(venues) {
        const grid = dom.venuesGrid || dom.allVenuesGrid;
        const emptyState = dom.venuesEmptyState || dom.allVenuesEmptyState;
        if (!grid || !emptyState) return;

        if (venues.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';

            let msg = "We couldn't find any venues matching your criteria.";
            if (state.activeVenueCategory && state.activeVenueCity) {
                msg = `No ${state.activeVenueCategory} found in ${state.activeVenueCity}.`;
            } else if (state.activeVenueCategory) {
                msg = `No venues found in ${state.activeVenueCategory}.`;
            } else if (state.activeVenueCity) {
                msg = `No venues available in ${state.activeVenueCity}.`;
            }
            const emptyMsgEl = dom.venuesEmptyMsg || dom.allVenuesEmptyMsg;
            if (emptyMsgEl) emptyMsgEl.textContent = msg;
        } else {
            emptyState.style.display = 'none';
            grid.style.display = 'grid';
            grid.innerHTML = venues.map(venue => createVenueCardHtml(venue)).join('');
            attachVenueCardListeners(grid);
        }
    }

    function syncVenueFilterControls(matchCount) {
        const catSelect = dom.venuesCategorySelect || dom.allVenuesCategorySelect;
        if (catSelect) {
            catSelect.value = state.activeVenueCategory;
        }

        const citySelect = dom.venuesCitySelect || dom.allVenuesCitySelect;
        if (citySelect) {
            citySelect.value = state.activeVenueCity;
        }

        const searchInput = dom.venuesSearchInput || dom.allVenuesSearchInput;
        if (searchInput && searchInput.value !== state.venueSearchQuery) {
            searchInput.value = state.venueSearchQuery;
        }

        const countEl = dom.venuesResultsCount || dom.allVenuesResultsCount;
        if (countEl) {
            if (state.activeVenueCategory || state.activeVenueCity || state.venueSearchQuery) {
                countEl.textContent = `Found ${matchCount} venue${matchCount === 1 ? '' : 's'}`;
            } else {
                countEl.textContent = `Showing all ${matchCount} venues`;
            }
        }

        const resetBtn = dom.btnVenuesReset || dom.btnAllVenuesResetBtn;
        if (resetBtn) {
            const hasFilter = Boolean(state.activeVenueCategory || state.activeVenueCity || state.venueSearchQuery);
            resetBtn.style.display = hasFilter ? 'inline-flex' : 'none';
        }
    }

    /**
     * Card HTML Generators
     */
    function createCategoryCardHtml(cat) {
        if (!cat) return '';
        const catImg = resolveCategoryImage(cat);
        const catIcon = resolveEventIcon(cat);
        const badgeClass = resolveEventBadgeClass(cat);
        const title = cat.title || cat.key || 'Category';
        const tagline = cat.tagline || '';
        const eventCount = (cat.eventCount !== undefined && cat.eventCount !== null) ? cat.eventCount : 3;
        const slug = cat.slug || 'all';
        const path = cat.path || `/events/${slug}`;

        return `
            <a href="${escapeHtml(path)}" class="category-card" data-slug="${escapeHtml(slug)}" aria-label="Explore ${escapeHtml(title)}">
                <div class="category-card-media">
                    <img src="${escapeHtml(catImg)}" alt="${escapeHtml(title)}" class="category-card-image" loading="lazy">
                    <div class="category-badge-floating ${escapeHtml(badgeClass)}">
                        <span>${escapeHtml(catIcon)} ${escapeHtml(title)}</span>
                    </div>
                </div>
                <div class="category-card-body">
                    <h3 class="category-card-title">${escapeHtml(title)}</h3>
                    <p class="category-card-description">${escapeHtml(tagline)}</p>
                    <div class="category-card-footer">
                        <span class="category-event-count">${eventCount} Events Available</span>
                        <span class="category-explore-link">Explore Category →</span>
                    </div>
                </div>
            </a>
        `;
    }

    function createVenueCategoryCardHtml(vc) {
        if (!vc) return '';
        const vcImg = resolveVenueImage(vc);
        const vcIcon = resolveVenueIcon(vc);
        const badgeClass = resolveVenueBadgeClass(vc);
        const title = vc.title || vc.key || 'Category';
        const tagline = vc.tagline || '';
        const venueCount = (vc.venueCount !== undefined && vc.venueCount !== null) ? vc.venueCount : 2;
        const slug = vc.slug || 'all';
        const path = vc.path || `/venues/${slug}`;

        return `
            <a href="${escapeHtml(path)}" class="category-card" data-slug="${escapeHtml(slug)}" aria-label="Explore ${escapeHtml(title)}">
                <div class="category-card-media">
                    <img src="${escapeHtml(vcImg)}" alt="${escapeHtml(title)}" class="category-card-image" loading="lazy">
                    <div class="category-badge-floating ${escapeHtml(badgeClass)}">
                        <span>${escapeHtml(vcIcon)} ${escapeHtml(title)}</span>
                    </div>
                </div>
                <div class="category-card-body">
                    <h3 class="category-card-title">${escapeHtml(title)}</h3>
                    <p class="category-card-description">${escapeHtml(tagline)}</p>
                    <div class="category-card-footer">
                        <span class="category-event-count">${venueCount} Venues Available</span>
                        <span class="category-explore-link">Explore Category →</span>
                    </div>
                </div>
            </a>
        `;
    }

    function createEventCardHtml(event) {
        if (!event) return '';
        const priceFormatted = inrFormatter.format(event.startingPrice || 0);
        const eventImg = resolveEventImage(event);
        const eventIcon = resolveEventIcon(event);
        const badgeClass = resolveEventBadgeClass(event);
        const categoryLabel = event.category || event.categoryTitle || 'Event';
        const eventId = event.id || event.code || '';
        const title = event.title || 'Untitled Event';
        const dateTime = event.dateTime || 'Upcoming';
        const city = event.city || 'India';
        const venue = event.venue || 'Venue';

        return `
            <article class="event-card" data-event-id="${escapeHtml(eventId)}" tabindex="0" role="article" aria-label="${escapeHtml(title)}">
                <div class="event-card-media">
                    <img
                        src="${escapeHtml(eventImg)}"
                        alt="${escapeHtml(title)}"
                        class="event-card-image"
                        loading="lazy"
                        onerror="this.onerror=null; this.src='/assets/categories/music-concert.jpg';"
                    >
                    <div class="category-badge-floating ${escapeHtml(badgeClass)}">
                        <span>${escapeHtml(eventIcon)} ${escapeHtml(categoryLabel)}</span>
                    </div>
                </div>

                <div class="event-card-body">
                    <div class="event-date-row">
                        <span class="event-date-icon" aria-hidden="true">📅</span>
                        <time class="event-date-text">${escapeHtml(dateTime)}</time>
                    </div>

                    <h3 class="event-card-title">${escapeHtml(title)}</h3>

                    <div class="event-location-row">
                        <span class="event-location-icon" aria-hidden="true">📍</span>
                        <span class="event-location-text">
                            <strong>${escapeHtml(city)}:</strong> ${escapeHtml(venue)}
                        </span>
                    </div>

                    ${getInventoryBadgeHtml(event.availableSeats, event.totalSeats)}

                    <div class="event-card-footer">
                        <div class="event-price-block">
                            <span class="price-label">Tickets From</span>
                            <span class="price-value">${priceFormatted}</span>
                        </div>

                        <button class="btn btn-primary btn-sm btn-view-details" type="button" data-event-id="${escapeHtml(eventId)}">
                            <span>View Details</span>
                        </button>
                    </div>
                </div>
            </article>
        `;
    }

    function createVenueCardHtml(venue) {
        if (!venue) return '';
        const rentalFormatted = inrFormatter.format(venue.baseRental || 0);
        const amenitiesHtml = (venue.amenities || []).slice(0, 3).map(a => `<span class="venue-tag">${escapeHtml(a)}</span>`).join('');
        const venueImg = resolveVenueImage(venue);
        const venueIcon = resolveVenueIcon(venue);
        const badgeClass = resolveVenueBadgeClass(venue);
        const categoryLabel = venue.category || venue.categoryTitle || 'Venue';
        const venueId = venue.id || venue.code || '';
        const name = venue.name || 'Untitled Venue';
        const city = venue.city || 'India';
        const location = venue.location || '';
        const suitableFor = venue.suitableFor || 'All Events';
        const capacity = venue.capacity || 'Varies';

        return `
            <article class="venue-card" data-venue-id="${escapeHtml(venueId)}" tabindex="0" role="article" aria-label="${escapeHtml(name)}">
                <div class="venue-card-media">
                    <img
                        src="${escapeHtml(venueImg)}"
                        alt="${escapeHtml(name)}"
                        class="venue-card-image"
                        loading="lazy"
                        onerror="this.onerror=null; this.src='/assets/venue-tech-convention.svg';"
                    >
                    <div class="category-badge-floating ${escapeHtml(badgeClass)}">
                        <span>${escapeHtml(venueIcon)} ${escapeHtml(categoryLabel)}</span>
                    </div>
                </div>

                <div class="venue-card-body">
                    <div class="venue-location-row">
                        <span class="venue-location-icon" aria-hidden="true">📍</span>
                        <span class="venue-location-text"><strong>${escapeHtml(city)}:</strong> ${escapeHtml(location)}</span>
                    </div>

                    <h3 class="venue-card-title">${escapeHtml(name)}</h3>

                    <p class="venue-card-suitable">
                        <strong>Suitable for:</strong> ${escapeHtml(suitableFor)}
                    </p>

                    <div class="venue-tags-row">
                        ${amenitiesHtml}
                    </div>

                    <div class="venue-specs-grid">
                        <div class="spec-item">
                            <span class="spec-label">Capacity</span>
                            <span class="spec-val">${escapeHtml(capacity)}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Base Rental</span>
                            <span class="spec-val text-primary font-bold">${rentalFormatted} / day</span>
                        </div>
                    </div>

                    <div class="venue-card-footer">
                        <button class="btn btn-outline btn-sm btn-inquire-venue w-full" type="button" data-venue-id="${escapeHtml(venueId)}">
                            <span>View Details &amp; Inquire</span>
                        </button>
                    </div>
                </div>
            </article>
        `;
    }

    function attachEventCardListeners(container) {
        if (!container) return;
        container.querySelectorAll('.btn-view-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const eventId = btn.dataset.eventId;
                openEventModal(eventId);
            });
        });

        container.querySelectorAll('.event-card').forEach(card => {
            card.addEventListener('click', () => {
                const eventId = card.dataset.eventId;
                openEventModal(eventId);
            });
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const eventId = card.dataset.eventId;
                    openEventModal(eventId);
                }
            });
        });
    }

    function attachVenueCardListeners(container) {
        if (!container) return;
        container.querySelectorAll('.btn-inquire-venue').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const venueId = btn.dataset.venueId;
                openVenueModal(venueId);
            });
        });

        container.querySelectorAll('.venue-card').forEach(card => {
            card.addEventListener('click', () => {
                const venueId = card.dataset.venueId;
                openVenueModal(venueId);
            });
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const venueId = card.dataset.venueId;
                    openVenueModal(venueId);
                }
            });
        });
    }

    /**
     * Modal Dialog Handlers & Live Backend Actions
     */

    function updateBookingTotal() {
        if (!state.selectedEvent || !dom.bookingTotalDisplay) return;
        const basePrice = Number(state.selectedEvent.startingPrice) || 0;
        const tier = dom.bookingTicketTier ? dom.bookingTicketTier.value : 'Standard Pass';
        let unitPrice = basePrice;
        if (tier === 'VIP Access Pass') {
            unitPrice = Math.round(basePrice * 1.5);
        } else if (tier === 'Early Bird Pass') {
            unitPrice = Math.round(basePrice * 0.85);
        }

        const qty = dom.bookingQuantity ? (parseInt(dom.bookingQuantity.value, 10) || 1) : 1;
        const total = unitPrice * qty;
        dom.bookingTotalDisplay.textContent = `${inrFormatter.format(total)} (${qty} × ${inrFormatter.format(unitPrice)})`;
    }

    async function openEventModal(eventId) {
        let event = (state.eventsData && state.eventsData.find(e => e.id === eventId || e.code === eventId)) ||
                    SAMPLE_EVENTS.find(e => e.id === eventId || e.code === eventId);
        if (!event || !dom.eventModal) return;

        state.selectedEvent = event;
        if (dom.modalEventImage) {
            dom.modalEventImage.src = resolveEventImage(event);
            dom.modalEventImage.alt = event.title || 'Event';
        }
        if (dom.modalEventCategory) {
            const eventIcon = resolveEventIcon(event);
            const badgeClass = resolveEventBadgeClass(event);
            const categoryLabel = event.category || 'Event';
            dom.modalEventCategory.textContent = `${eventIcon} ${categoryLabel}`;
            dom.modalEventCategory.className = `modal-category-badge ${badgeClass}`;
        }
        if (dom.modalEventTitle) dom.modalEventTitle.textContent = event.title;
        if (dom.modalEventDate) dom.modalEventDate.textContent = event.dateTime;
        if (dom.modalEventVenue) dom.modalEventVenue.textContent = `${event.venue}, ${event.city}`;
        if (dom.modalEventPrice) dom.modalEventPrice.textContent = `From ${inrFormatter.format(event.startingPrice)}`;
        if (dom.modalEventOrganizer) dom.modalEventOrganizer.textContent = event.organizer;
        if (dom.modalEventDescription) dom.modalEventDescription.textContent = event.description;
        updateModalAvailability(event);

        // Reset booking form and confirmation state
        if (dom.eventBookingSection) dom.eventBookingSection.style.display = 'block';
        if (dom.eventBookingConfirmation) dom.eventBookingConfirmation.style.display = 'none';

        // Pre-fill user details if logged in
        if (dom.bookingName && !dom.bookingName.value) {
            dom.bookingName.value = state.currentUser ? state.currentUser.name : '';
        }
        if (dom.bookingEmail && !dom.bookingEmail.value) {
            dom.bookingEmail.value = state.currentUser ? state.currentUser.email : '';
        }
        if (dom.bookingPhone && !dom.bookingPhone.value && state.currentUser && state.currentUser.phone) {
            dom.bookingPhone.value = state.currentUser.phone;
        }

        updateBookingTotal();

        dom.eventModal.classList.add('is-open', 'show');
        dom.eventModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');

        // Fetch fresh details from backend to ensure available seats and metadata are live
        try {
            const fresh = await apiClient.get(`/api/events/${encodeURIComponent(eventId)}`);
            if (fresh && fresh.data) {
                const freshEvent = { ...event, ...fresh.data };
                freshEvent.image = resolveEventImage(freshEvent);
                freshEvent.categoryIcon = resolveEventIcon(freshEvent);
                freshEvent.categoryBadgeClass = resolveEventBadgeClass(freshEvent);
                state.selectedEvent = freshEvent;
                event = state.selectedEvent;
                if (dom.modalEventCategory) {
                    dom.modalEventCategory.textContent = `${event.categoryIcon} ${event.category || 'Event'}`;
                    dom.modalEventCategory.className = `modal-category-badge ${event.categoryBadgeClass}`;
                }
                if (dom.modalEventImage) {
                    dom.modalEventImage.src = event.image;
                }
                if (dom.modalEventPrice) dom.modalEventPrice.textContent = `From ${inrFormatter.format(event.startingPrice)}`;
                updateModalAvailability(event);
                updateBookingTotal();
            }
        } catch (e) {
            console.debug('[VenueVista] Using cached event for modal:', eventId);
        }
    }

    function closeEventModal() {
        if (!dom.eventModal) return;
        dom.eventModal.classList.remove('is-open', 'show');
        dom.eventModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        state.selectedEvent = null;
    }

    async function handleEventBookingSubmit(e) {
        if (e) e.preventDefault();
        if (!state.selectedEvent) {
            showToast('Please select an event before booking.');
            return;
        }

        const quantity = dom.bookingQuantity ? parseInt(dom.bookingQuantity.value, 10) : 1;
        const ticketTier = dom.bookingTicketTier ? dom.bookingTicketTier.value : 'Standard Pass';
        const customerName = dom.bookingName ? dom.bookingName.value.trim() : '';
        const customerEmail = dom.bookingEmail ? dom.bookingEmail.value.trim() : '';
        const customerPhone = dom.bookingPhone ? dom.bookingPhone.value.trim() : '';

        if (!customerName || !customerEmail) {
            showToast('Please enter attendee name and email.');
            return;
        }

        const submitBtn = dom.btnModalBook;
        const originalText = submitBtn ? submitBtn.innerHTML : 'Confirm Ticket Pass';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Reserving Pass...</span>';
        }

        try {
            const payload = {
                eventCode: state.selectedEvent.id || state.selectedEvent.code,
                quantity: quantity,
                ticketTier: ticketTier,
                customerName: customerName,
                customerEmail: customerEmail,
                customerPhone: customerPhone || '+91 98765 43210',
                notes: 'College MVP Ticket Reservation'
            };

            const res = await apiClient.post('/api/bookings', payload);
            const booking = (res && res.data) ? res.data : null;

            if (!booking) {
                throw new Error('Booking response was empty.');
            }

            // Populate confirmation card
            const codeEl = document.getElementById('booking-confirmed-code');
            const eventEl = document.getElementById('booking-confirmed-event');
            const qtyEl = document.getElementById('booking-confirmed-qty');
            const amountEl = document.getElementById('booking-confirmed-amount');
            const attendeeEl = document.getElementById('booking-confirmed-attendee');

            if (codeEl) codeEl.textContent = booking.bookingCode;
            if (eventEl) eventEl.textContent = state.selectedEvent.title;
            if (qtyEl) qtyEl.textContent = `${booking.quantity} Ticket${booking.quantity > 1 ? 's' : ''} (${booking.ticketTier || ticketTier})`;
            if (amountEl) amountEl.textContent = inrFormatter.format(booking.totalAmount);
            if (attendeeEl) attendeeEl.textContent = `${booking.customerName} (${booking.customerEmail})`;

            // Switch view inside modal
            if (dom.eventBookingSection) dom.eventBookingSection.style.display = 'none';
            if (dom.eventBookingConfirmation) dom.eventBookingConfirmation.style.display = 'block';

            showToast(`✓ Ticket Confirmed! Booking code: ${booking.bookingCode}`);

            // Immediately update and synchronize seat availability across card, modal, and state
            const targetCode = state.selectedEvent.id || state.selectedEvent.code;
            let updatedSeats = (booking.availableSeats !== undefined && booking.availableSeats !== null)
                ? booking.availableSeats
                : (state.selectedEvent.availableSeats !== undefined ? state.selectedEvent.availableSeats - quantity : null);

            try {
                const freshRes = await apiClient.get(`/api/events/${encodeURIComponent(targetCode)}`);
                if (freshRes && freshRes.data && freshRes.data.availableSeats !== undefined) {
                    updatedSeats = freshRes.data.availableSeats;
                    state.selectedEvent = { ...state.selectedEvent, ...freshRes.data };
                }
            } catch (freshErr) {
                console.debug('[VenueVista] Using response/local calculation for seat update:', freshErr);
            }

            if (updatedSeats !== null) {
                state.selectedEvent.availableSeats = updatedSeats;
                updateModalAvailability(state.selectedEvent);

                // Update in state.eventsData
                const matchedInEvents = state.eventsData.find(e => (e.id === targetCode || e.code === targetCode));
                if (matchedInEvents) {
                    matchedInEvents.availableSeats = updatedSeats;
                }
                const matchedInSample = SAMPLE_EVENTS.find(e => (e.id === targetCode || e.code === targetCode));
                if (matchedInSample) {
                    matchedInSample.availableSeats = updatedSeats;
                }

                // Immediately re-render the event cards on the active page
                renderEventsGrid(state.eventsData);
            }
        } catch (err) {
            console.error('[VenueVista] Booking submission failed:', err);
            showToast(`Booking error: ${err.message || 'Could not complete reservation'}`);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        }
    }

    async function openVenueModal(venueId) {
        let venue = (state.venuesData && state.venuesData.find(v => v.id === venueId || v.code === venueId)) ||
                    SAMPLE_VENUES.find(v => v.id === venueId || v.code === venueId);
        if (!venue || !dom.venueModal) return;

        state.selectedVenue = venue;
        if (dom.venueModalImage) {
            dom.venueModalImage.src = resolveVenueImage(venue);
            dom.venueModalImage.alt = venue.name || 'Venue';
        }
        if (dom.venueModalBadge) {
            const venueIcon = resolveVenueIcon(venue);
            const badgeClass = resolveVenueBadgeClass(venue);
            const categoryLabel = venue.category || 'Venue';
            dom.venueModalBadge.textContent = `${venueIcon} ${categoryLabel}`;
            dom.venueModalBadge.className = `modal-category-badge ${badgeClass}`;
        }
        if (dom.venueModalTitle) dom.venueModalTitle.textContent = venue.name;
        if (dom.venueModalLocation) dom.venueModalLocation.textContent = `${venue.location}, ${venue.city}`;
        if (dom.venueModalCapacity) dom.venueModalCapacity.textContent = venue.capacity;
        if (dom.venueModalPrice) dom.venueModalPrice.textContent = `${inrFormatter.format(venue.baseRental)} / day (Indicative Base)`;

        // Reset inquiry form and confirmation state
        if (dom.venueInquiryForm) dom.venueInquiryForm.style.display = 'flex';
        if (dom.venueInquiryConfirmation) dom.venueInquiryConfirmation.style.display = 'none';

        // Pre-fill user details if logged in
        const nameInput = document.getElementById('inquiry-name');
        const contactInput = document.getElementById('inquiry-contact');
        if (nameInput && !nameInput.value && state.currentUser) {
            nameInput.value = state.currentUser.name;
        }
        if (contactInput && !contactInput.value && state.currentUser) {
            contactInput.value = state.currentUser.email;
        }

        dom.venueModal.classList.add('is-open', 'show');
        dom.venueModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');

        // Fetch fresh details from backend
        try {
            const fresh = await apiClient.get(`/api/venues/${encodeURIComponent(venueId)}`);
            if (fresh && fresh.data) {
                const freshVenue = { ...venue, ...fresh.data };
                freshVenue.image = resolveVenueImage(freshVenue);
                freshVenue.categoryIcon = resolveVenueIcon(freshVenue);
                freshVenue.categoryBadgeClass = resolveVenueBadgeClass(freshVenue);
                state.selectedVenue = freshVenue;
                venue = state.selectedVenue;
                if (dom.venueModalBadge) {
                    dom.venueModalBadge.textContent = `${venue.categoryIcon} ${venue.category || 'Venue'}`;
                    dom.venueModalBadge.className = `modal-category-badge ${venue.categoryBadgeClass}`;
                }
                if (dom.venueModalImage) {
                    dom.venueModalImage.src = venue.image;
                }
                if (dom.venueModalPrice) dom.venueModalPrice.textContent = `${inrFormatter.format(venue.baseRental)} / day (Indicative Base)`;
            }
        } catch (e) {
            console.debug('[VenueVista] Using cached venue for modal:', venueId);
        }
    }

    function closeVenueModal() {
        if (!dom.venueModal) return;
        dom.venueModal.classList.remove('is-open', 'show');
        dom.venueModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        state.selectedVenue = null;
    }

    async function handleVenueInquirySubmit(e) {
        if (e) e.preventDefault();
        if (!state.selectedVenue) {
            showToast('Please select a venue before submitting an inquiry.');
            return;
        }

        const dateInput = document.getElementById('inquiry-date');
        const eventTypeInput = document.getElementById('inquiry-event-type');
        const attendanceInput = document.getElementById('inquiry-attendance');
        const durationInput = document.getElementById('inquiry-duration');
        const nameInput = document.getElementById('inquiry-name');
        const contactInput = document.getElementById('inquiry-contact');

        const contactName = nameInput ? nameInput.value.trim() : '';
        const contactPhoneEmail = contactInput ? contactInput.value.trim() : '';
        const requestedDate = dateInput ? dateInput.value : '2026-11-20';
        const eventType = eventTypeInput ? eventTypeInput.value : 'Conference';
        const expectedAttendance = attendanceInput ? attendanceInput.value : '500-1500';
        const rentalDuration = durationInput ? durationInput.value : 'Full Day (10 Hours)';

        if (!contactName || !contactPhoneEmail || !requestedDate) {
            showToast('Please fill in required contact and date fields.');
            return;
        }

        const submitBtn = dom.btnSubmitInquiry;
        const originalText = submitBtn ? submitBtn.innerHTML : 'Submit Rental Inquiry';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Dispatching Inquiry...</span>';
        }

        try {
            const payload = {
                venueCode: state.selectedVenue.id || state.selectedVenue.code,
                eventType: eventType,
                requestedDate: requestedDate,
                expectedAttendance: expectedAttendance,
                rentalDuration: rentalDuration,
                contactName: contactName,
                contactPhoneEmail: contactPhoneEmail,
                notes: 'College MVP Venue Rental Inquiry'
            };

            const res = await apiClient.post('/api/venues/inquiries', payload);
            const inquiry = (res && res.data) ? res.data : null;

            if (!inquiry) {
                throw new Error('Inquiry response was empty.');
            }

            // Populate confirmation card
            const codeEl = document.getElementById('inquiry-confirmed-code');
            const venueEl = document.getElementById('inquiry-confirmed-venue');
            const typeEl = document.getElementById('inquiry-confirmed-type');
            const dateEl = document.getElementById('inquiry-confirmed-date');
            const durationEl = document.getElementById('inquiry-confirmed-duration');
            const quoteEl = document.getElementById('inquiry-confirmed-quote');

            if (codeEl) codeEl.textContent = inquiry.inquiryCode;
            if (venueEl) venueEl.textContent = inquiry.venueName || state.selectedVenue.name;
            if (typeEl) typeEl.textContent = inquiry.eventType;
            if (dateEl) dateEl.textContent = inquiry.requestedDate;
            if (durationEl) durationEl.textContent = inquiry.rentalDuration;
            if (quoteEl) quoteEl.textContent = inrFormatter.format(inquiry.estimatedQuote);

            // Switch view inside modal
            if (dom.venueInquiryForm) dom.venueInquiryForm.style.display = 'none';
            if (dom.venueInquiryConfirmation) dom.venueInquiryConfirmation.style.display = 'block';

            showToast(`✓ Inquiry Dispatched! Reference: ${inquiry.inquiryCode}`);
        } catch (err) {
            console.error('[VenueVista] Venue inquiry submission failed:', err);
            showToast(`Inquiry error: ${err.message || 'Could not dispatch inquiry'}`);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        }
    }

    /**
     * User Authentication UI & Session Management
     */

    function switchAuthTab(tabName) {
        state.authMode = tabName;
        if (dom.authErrorAlert) {
            dom.authErrorAlert.style.display = 'none';
            dom.authErrorAlert.textContent = '';
        }

        if (tabName === 'register') {
            if (dom.authTabRegister) {
                dom.authTabRegister.classList.add('active');
                dom.authTabRegister.setAttribute('aria-selected', 'true');
            }
            if (dom.authTabLogin) {
                dom.authTabLogin.classList.remove('active');
                dom.authTabLogin.setAttribute('aria-selected', 'false');
            }
            if (dom.formAuthRegister) dom.formAuthRegister.style.display = 'block';
            if (dom.formAuthLogin) dom.formAuthLogin.style.display = 'none';

            if (!state.registrationSession) {
                setRegistrationStep(1);
            }
        } else {
            if (dom.authTabLogin) {
                dom.authTabLogin.classList.add('active');
                dom.authTabLogin.setAttribute('aria-selected', 'true');
            }
            if (dom.authTabRegister) {
                dom.authTabRegister.classList.remove('active');
                dom.authTabRegister.setAttribute('aria-selected', 'false');
            }
            if (dom.formAuthLogin) dom.formAuthLogin.style.display = 'block';
            if (dom.formAuthRegister) dom.formAuthRegister.style.display = 'none';

            if (state.lastRegisteredEmail) {
                const em = document.getElementById('login-email');
                if (em) em.value = state.lastRegisteredEmail;
            }
        }
    }

    function openAuthModal(initialTab = 'login') {
        if (!dom.authModal) return;
        switchAuthTab(initialTab);
        dom.authModal.classList.add('is-open', 'show');
        dom.authModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    }

    function closeAuthModal() {
        if (!dom.authModal) return;
        dom.authModal.classList.remove('is-open', 'show');
        dom.authModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        if (dom.authErrorAlert) dom.authErrorAlert.style.display = 'none';

        if (state.postLoginRedirect && !state.currentUser) {
            state.postLoginRedirect = null;
            if (window.location.pathname.startsWith('/my-') || window.location.pathname.startsWith('/account-')) {
                navigateTo('/');
            }
        }
    }

    async function handleLoginSubmit(e) {
        if (e) e.preventDefault();
        const emailInput = document.getElementById('login-email');
        const passInput = document.getElementById('login-password');
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passInput ? passInput.value : '';

        if (!email || !password) {
            showAuthError('Please enter both email and password.');
            return;
        }

        const submitBtn = document.getElementById('btn-submit-login');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Signing In...</span>';
        }

        try {
            const res = await apiClient.post('/api/auth/login', { email, password });
            if (res && res.data && res.data.token) {
                try {
                    localStorage.setItem(CONFIG.tokenStorageKey, res.data.token);
                    localStorage.setItem(CONFIG.userStorageKey, JSON.stringify(res.data.user));
                } catch (storeErr) {
                    console.warn('[VenueVista] Could not store JWT in localStorage:', storeErr);
                }

                state.currentUser = res.data.user;
                updateAuthNav();
                closeAuthModal();
                showToast(`Welcome back, ${res.data.user.name}!`);

                // Pre-fill modal contact fields if open
                if (dom.bookingName) dom.bookingName.value = res.data.user.name;
                if (dom.bookingEmail) dom.bookingEmail.value = res.data.user.email;

                // Restore navigation to intended protected account page if pending
                if (state.postLoginRedirect) {
                    const dest = state.postLoginRedirect;
                    state.postLoginRedirect = null;
                    navigateTo(dest);
                }
            } else {
                throw new Error('Unexpected authentication response format.');
            }
        } catch (err) {
            console.error('[VenueVista] Login failed:', err);
            showAuthError(err.message || 'Invalid email or password.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>Sign In</span>';
            }
        }
    }

    /**
     * Dual OTP Registration Multi-Step State & Handlers
     */
    function setRegistrationStep(step) {
        state.registrationStep = step;
        if (dom.authErrorAlert) {
            dom.authErrorAlert.style.display = 'none';
            dom.authErrorAlert.textContent = '';
        }

        const step1 = document.getElementById('reg-step-1');
        const step2 = document.getElementById('reg-step-2');
        const step3 = document.getElementById('reg-step-3');
        const step4 = document.getElementById('reg-step-4');

        const b1 = document.getElementById('step-badge-1');
        const b2 = document.getElementById('step-badge-2');
        const b3 = document.getElementById('step-badge-3');
        const l1 = document.getElementById('step-line-1');
        const l2 = document.getElementById('step-line-2');

        if (step1) step1.style.display = (step === 1) ? 'block' : 'none';
        if (step2) step2.style.display = (step === 2) ? 'block' : 'none';
        if (step3) step3.style.display = (step === 3) ? 'block' : 'none';
        if (step4) step4.style.display = (step === 4) ? 'block' : 'none';

        if (b1) {
            b1.className = 'reg-step' + (step === 1 ? ' active' : (step > 1 ? ' completed' : ''));
            const num1 = b1.querySelector('.step-num');
            if (num1) num1.textContent = (step > 1) ? '✓' : '1';
        }
        if (l1) {
            l1.className = 'step-line' + (step > 1 ? ' completed' : '');
        }

        if (b2) {
            b2.className = 'reg-step' + (step === 2 ? ' active' : (step > 2 ? ' completed' : ''));
            const num2 = b2.querySelector('.step-num');
            if (num2) num2.textContent = (step > 2) ? '✓' : '2';
        }
        if (l2) {
            l2.className = 'step-line' + (step > 2 ? ' completed' : '');
        }

        if (b3) {
            b3.className = 'reg-step' + (step === 3 ? ' active' : (step > 3 ? ' completed' : ''));
            const num3 = b3.querySelector('.step-num');
            if (num3) num3.textContent = (step > 3) ? '✓' : '3';
        }
    }

    function resetRegistrationWizard() {
        if (state.emailCooldownTimer) {
            clearInterval(state.emailCooldownTimer);
            state.emailCooldownTimer = null;
        }
        if (state.phoneCooldownTimer) {
            clearInterval(state.phoneCooldownTimer);
            state.phoneCooldownTimer = null;
        }

        const nameInput = document.getElementById('reg-name');
        const emailInput = document.getElementById('reg-email');
        const phoneInput = document.getElementById('reg-phone');
        const passInput = document.getElementById('reg-password');
        const confirmPassInput = document.getElementById('reg-confirm-password');
        const emailOtpInput = document.getElementById('reg-email-otp');
        const phoneOtpInput = document.getElementById('reg-phone-otp');

        if (nameInput) nameInput.value = '';
        if (emailInput) emailInput.value = '';
        if (phoneInput) phoneInput.value = '';
        if (passInput) passInput.value = '';
        if (confirmPassInput) confirmPassInput.value = '';
        if (emailOtpInput) emailOtpInput.value = '';
        if (phoneOtpInput) phoneOtpInput.value = '';

        state.registrationSession = null;
        setRegistrationStep(1);
    }

    function startResendCooldown(target, seconds) {
        let remaining = seconds || 30;
        const btnId = target === 'EMAIL' ? 'btn-resend-email-otp' : 'btn-resend-phone-otp';
        const timerId = target === 'EMAIL' ? 'reg-email-countdown' : 'reg-phone-countdown';
        const timerProp = target === 'EMAIL' ? 'emailCooldownTimer' : 'phoneCooldownTimer';

        const btn = document.getElementById(btnId);
        const timerElem = document.getElementById(timerId);

        if (state[timerProp]) {
            clearInterval(state[timerProp]);
            state[timerProp] = null;
        }

        if (btn) btn.disabled = true;
        if (timerElem) {
            timerElem.textContent = `(${remaining}s)`;
            timerElem.style.display = 'inline';
        }

        state[timerProp] = setInterval(() => {
            remaining--;
            if (remaining > 0) {
                if (timerElem) timerElem.textContent = `(${remaining}s)`;
            } else {
                clearInterval(state[timerProp]);
                state[timerProp] = null;
                if (btn) btn.disabled = false;
                if (timerElem) timerElem.style.display = 'none';
            }
        }, 1000);
    }

    async function handleRegistrationStart(e) {
        if (e) e.preventDefault();
        const nameInput = document.getElementById('reg-name');
        const emailInput = document.getElementById('reg-email');
        const phoneInput = document.getElementById('reg-phone');
        const passInput = document.getElementById('reg-password');
        const confirmPassInput = document.getElementById('reg-confirm-password');

        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const phone = phoneInput ? phoneInput.value.trim() : '';
        const password = passInput ? passInput.value : '';
        const confirmPassword = confirmPassInput ? confirmPassInput.value : '';

        if (!name || !email || !phone || !password || !confirmPassword) {
            showAuthError('Please fill in all registration fields.');
            return;
        }

        if (password.length < 6) {
            showAuthError('Password must be at least 6 characters.');
            return;
        }

        if (password !== confirmPassword) {
            showAuthError('Passwords do not match. Please re-enter.');
            return;
        }

        const submitBtn = document.getElementById('btn-submit-register');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Generating Verification Code...</span>';
        }

        try {
            const res = await apiClient.post('/api/auth/registration/start', {
                name,
                email,
                phone,
                password,
                confirmPassword
            });

            if (res && res.data && res.data.sessionId) {
                state.registrationSession = res.data;

                const displayEmail = document.getElementById('reg-display-email');
                if (displayEmail) displayEmail.textContent = res.data.email;

                const demoPanel = document.getElementById('demo-email-otp-panel');
                const demoVal = document.getElementById('demo-email-otp-val');
                if (res.data.demoMode && res.data.demoEmailOtp) {
                    if (demoVal) demoVal.textContent = res.data.demoEmailOtp;
                    if (demoPanel) demoPanel.style.display = 'block';
                } else if (demoPanel) {
                    demoPanel.style.display = 'none';
                }

                setRegistrationStep(2);
                startResendCooldown('EMAIL', res.data.resendCooldownSeconds || 30);

                const otpInput = document.getElementById('reg-email-otp');
                if (otpInput) {
                    otpInput.value = '';
                    otpInput.focus();
                }
            } else {
                throw new Error('Invalid response from registration service.');
            }
        } catch (err) {
            console.error('[VenueVista] Registration start failed:', err);
            showAuthError(err.message || 'Unable to start registration. Email or phone may already be registered.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>Continue to Verification →</span>';
            }
        }
    }

    async function handleVerifyEmailOtp(e) {
        if (e) e.preventDefault();
        if (!state.registrationSession || !state.registrationSession.sessionId) {
            showAuthError('Registration session expired. Please restart.');
            setRegistrationStep(1);
            return;
        }

        const otpInput = document.getElementById('reg-email-otp');
        const otp = otpInput ? otpInput.value.trim() : '';

        if (!otp || !/^\d{6}$/.test(otp)) {
            showAuthError('Please enter the 6-digit numeric verification code.');
            return;
        }

        const verifyBtn = document.getElementById('btn-verify-email-otp');
        if (verifyBtn) {
            verifyBtn.disabled = true;
            verifyBtn.innerHTML = '<span>Verifying Email...</span>';
        }

        try {
            const res = await apiClient.post('/api/auth/registration/verify-email', {
                sessionId: state.registrationSession.sessionId,
                otp
            });

            if (res && res.data) {
                state.registrationSession = res.data;

                const displayPhone = document.getElementById('reg-display-phone');
                if (displayPhone) displayPhone.textContent = res.data.phone;

                const demoPanel = document.getElementById('demo-phone-otp-panel');
                const demoVal = document.getElementById('demo-phone-otp-val');
                if (res.data.demoMode && res.data.demoPhoneOtp) {
                    if (demoVal) demoVal.textContent = res.data.demoPhoneOtp;
                    if (demoPanel) demoPanel.style.display = 'block';
                } else if (demoPanel) {
                    demoPanel.style.display = 'none';
                }

                setRegistrationStep(3);
                startResendCooldown('PHONE', res.data.resendCooldownSeconds || 30);

                const phoneOtpInput = document.getElementById('reg-phone-otp');
                if (phoneOtpInput) {
                    phoneOtpInput.value = '';
                    phoneOtpInput.focus();
                }
            } else {
                throw new Error('Invalid response during email verification.');
            }
        } catch (err) {
            console.error('[VenueVista] Email OTP verification failed:', err);
            showAuthError(err.message || 'Invalid or expired email verification code.');
        } finally {
            if (verifyBtn) {
                verifyBtn.disabled = false;
                verifyBtn.innerHTML = '<span>Verify Email →</span>';
            }
        }
    }

    async function handleVerifyPhoneOtp(e) {
        if (e) e.preventDefault();
        if (!state.registrationSession || !state.registrationSession.sessionId) {
            showAuthError('Registration session expired. Please restart.');
            setRegistrationStep(1);
            return;
        }

        const otpInput = document.getElementById('reg-phone-otp');
        const otp = otpInput ? otpInput.value.trim() : '';

        if (!otp || !/^\d{6}$/.test(otp)) {
            showAuthError('Please enter the 6-digit numeric verification code.');
            return;
        }

        const verifyBtn = document.getElementById('btn-verify-phone-otp');
        if (verifyBtn) {
            verifyBtn.disabled = true;
            verifyBtn.innerHTML = '<span>Creating Account...</span>';
        }

        try {
            const res = await apiClient.post('/api/auth/registration/verify-phone', {
                sessionId: state.registrationSession.sessionId,
                otp
            });

            if (res && res.data && res.data.currentStep === 'COMPLETED') {
                const userEmail = state.registrationSession.email;
                state.registrationSession = null;
                setRegistrationStep(4);
                showToast('✓ Registration complete! Both email and phone verified.');

                // Store registered email for quick sign-in prefill
                state.lastRegisteredEmail = userEmail;
            } else {
                throw new Error('Registration could not be completed.');
            }
        } catch (err) {
            console.error('[VenueVista] Phone OTP verification failed:', err);
            showAuthError(err.message || 'Invalid or expired phone verification code.');
        } finally {
            if (verifyBtn) {
                verifyBtn.disabled = false;
                verifyBtn.innerHTML = '<span>Verify & Complete Registration</span>';
            }
        }
    }

    async function handleResendOtp(target) {
        if (!state.registrationSession || !state.registrationSession.sessionId) {
            showAuthError('Registration session expired. Please restart.');
            setRegistrationStep(1);
            return;
        }

        try {
            const res = await apiClient.post('/api/auth/registration/resend-otp', {
                sessionId: state.registrationSession.sessionId,
                target
            });

            if (res && res.data) {
                state.registrationSession = res.data;
                if (target === 'EMAIL') {
                    if (res.data.demoEmailOtp) {
                        const demoVal = document.getElementById('demo-email-otp-val');
                        if (demoVal) demoVal.textContent = res.data.demoEmailOtp;
                    }
                    startResendCooldown('EMAIL', res.data.resendCooldownSeconds || 30);
                    showToast('A new demo email verification code has been generated.');
                } else if (target === 'PHONE') {
                    if (res.data.demoPhoneOtp) {
                        const demoVal = document.getElementById('demo-phone-otp-val');
                        if (demoVal) demoVal.textContent = res.data.demoPhoneOtp;
                    }
                    startResendCooldown('PHONE', res.data.resendCooldownSeconds || 30);
                    showToast('A new demo phone verification code has been generated.');
                }
            }
        } catch (err) {
            console.error(`[VenueVista] Resend ${target} OTP failed:`, err);
            showAuthError(err.message || `Could not resend ${target} OTP. Cooldown may still be active.`);
        }
    }

    function showAuthError(msg) {
        if (dom.authErrorAlert) {
            dom.authErrorAlert.textContent = msg;
            dom.authErrorAlert.style.display = 'block';
        } else {
            showToast(msg);
        }
    }

    function closeAccountDropdown() {
        const menu = document.getElementById('account-dropdown-menu');
        const btn = document.getElementById('account-menu-toggle');
        if (menu) menu.style.display = 'none';
        if (btn) btn.setAttribute('aria-expanded', 'false');
    }

    function toggleAccountDropdown(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const menu = document.getElementById('account-dropdown-menu');
        const btn = document.getElementById('account-menu-toggle');
        if (!menu || !btn) return;
        const isOpen = menu.style.display !== 'none';
        if (isOpen) {
            closeAccountDropdown();
        } else {
            menu.style.display = 'block';
            btn.setAttribute('aria-expanded', 'true');
        }
    }

    function handleLogout() {
        try {
            localStorage.removeItem(CONFIG.tokenStorageKey);
            localStorage.removeItem(CONFIG.userStorageKey);
        } catch (e) {
            console.warn('[VenueVista] Error clearing token:', e);
        }
        state.currentUser = null;
        state.myBookings = [];
        state.myInquiries = [];
        closeAccountDropdown();
        updateAuthNav();
        showToast('Signed out successfully.');
        navigateTo('/');
    }

    function updateAuthNav() {
        const headerActions = dom.headerActions;
        if (!headerActions) return;

        const existingMenu = document.getElementById('account-menu-wrapper');
        const legacyWrapper = document.getElementById('auth-user-wrapper');
        if (legacyWrapper) legacyWrapper.remove();

        if (state.currentUser) {
            if (dom.btnLogin) dom.btnLogin.style.display = 'none';
            if (dom.btnRegister) dom.btnRegister.style.display = 'none';

            const initial = (state.currentUser.name || 'U').charAt(0).toUpperCase();
            const userName = state.currentUser.name || 'User';
            const userEmail = state.currentUser.email || '';

            if (!existingMenu) {
                const wrapper = document.createElement('div');
                wrapper.className = 'account-menu-wrapper';
                wrapper.id = 'account-menu-wrapper';

                wrapper.innerHTML = `
                    <button class="account-menu-btn" id="account-menu-toggle" type="button" aria-haspopup="true" aria-expanded="false" title="Account menu">
                        <div class="auth-user-avatar">${escapeHtml(initial)}</div>
                        <span class="account-user-name">${escapeHtml(userName)}</span>
                        <svg class="dropdown-chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                    <div class="account-dropdown-menu" id="account-dropdown-menu" role="menu" aria-label="User Account Menu" style="display: none;">
                        <div class="account-dropdown-header">
                            <div class="account-header-avatar">${escapeHtml(initial)}</div>
                            <div class="account-header-info">
                                <div class="account-header-name">${escapeHtml(userName)}</div>
                                <div class="account-header-email">${escapeHtml(userEmail)}</div>
                            </div>
                        </div>
                        <div class="account-dropdown-divider"></div>
                        <div class="account-dropdown-list">
                            <a href="/my-profile" class="account-dropdown-item" role="menuitem" data-action="profile">
                                <svg class="dropdown-item-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                <span>My Profile</span>
                            </a>
                            <a href="/my-bookings" class="account-dropdown-item" role="menuitem" data-action="bookings">
                                <svg class="dropdown-item-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                <span>My Bookings</span>
                            </a>
                            <div class="account-dropdown-sublinks">
                                <a href="/my-bookings?tab=tickets" class="account-dropdown-subitem" role="menuitem" data-action="tickets">
                                    <svg class="dropdown-item-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"></path>
                                    </svg>
                                    <span>My Tickets</span>
                                </a>
                                <a href="/my-bookings?tab=inquiries" class="account-dropdown-subitem" role="menuitem" data-action="inquiries">
                                    <svg class="dropdown-item-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M3 21h18"></path>
                                        <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path>
                                        <path d="M9 9h1"></path><path d="M9 13h1"></path><path d="M9 17h1"></path>
                                        <path d="M14 9h1"></path><path d="M14 13h1"></path><path d="M14 17h1"></path>
                                    </svg>
                                    <span>My Venue Inquiries</span>
                                </a>
                            </div>
                            <a href="/account-settings" class="account-dropdown-item" role="menuitem" data-action="settings">
                                <svg class="dropdown-item-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="3"></circle>
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                                </svg>
                                <span>Account Settings</span>
                            </a>
                        </div>
                        <div class="account-dropdown-divider"></div>
                        <button type="button" class="account-dropdown-item account-dropdown-logout" id="btn-dropdown-logout" role="menuitem">
                            <svg class="dropdown-item-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            <span>Sign Out</span>
                        </button>
                    </div>
                `;
                headerActions.appendChild(wrapper);

                const toggleBtn = wrapper.querySelector('#account-menu-toggle');
                if (toggleBtn) {
                    toggleBtn.addEventListener('click', toggleAccountDropdown);
                }

                const logoutBtn = wrapper.querySelector('#btn-dropdown-logout');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        closeAccountDropdown();
                        handleLogout();
                    });
                }

                // Close dropdown on option selection
                wrapper.querySelectorAll('.account-dropdown-item, .account-dropdown-subitem').forEach(item => {
                    if (item.id !== 'btn-dropdown-logout') {
                        item.addEventListener('click', () => {
                            closeAccountDropdown();
                        });
                    }
                });
            } else {
                const nameEl = existingMenu.querySelector('.account-user-name');
                const headerName = existingMenu.querySelector('.account-header-name');
                const headerEmail = existingMenu.querySelector('.account-header-email');
                const avatar = existingMenu.querySelector('.account-menu-btn .auth-user-avatar');
                const headerAvatar = existingMenu.querySelector('.account-header-avatar');

                if (nameEl) nameEl.textContent = userName;
                if (headerName) headerName.textContent = userName;
                if (headerEmail) headerEmail.textContent = userEmail;
                if (avatar) avatar.textContent = initial;
                if (headerAvatar) headerAvatar.textContent = initial;
            }
        } else {
            if (existingMenu) existingMenu.remove();
            if (dom.btnLogin) dom.btnLogin.style.display = '';
            if (dom.btnRegister) dom.btnRegister.style.display = '';
        }
    }

    async function initAuthSession() {
        let storedToken = null;
        let storedUser = null;
        try {
            storedToken = localStorage.getItem(CONFIG.tokenStorageKey);
            const rawUser = localStorage.getItem(CONFIG.userStorageKey);
            if (rawUser) storedUser = JSON.parse(rawUser);
        } catch (e) {
            console.warn('[VenueVista] Could not read session from storage:', e);
        }

        if (!storedToken) {
            state.currentUser = null;
            updateAuthNav();
            return;
        }

        if (storedUser) {
            state.currentUser = storedUser;
            updateAuthNav();
        }

        try {
            const res = await apiClient.get('/api/auth/me');
            if (res && res.data) {
                state.currentUser = res.data;
                try {
                    localStorage.setItem(CONFIG.userStorageKey, JSON.stringify(res.data));
                } catch (e) {}
                console.log(`[VenueVista] Authenticated session restored for: ${res.data.name} (${res.data.email})`);
                updateAuthNav();
            }
        } catch (err) {
            console.warn('[VenueVista] Token validation failed or expired. Resetting session.', err);
            try {
                localStorage.removeItem(CONFIG.tokenStorageKey);
                localStorage.removeItem(CONFIG.userStorageKey);
            } catch (e) {}
            state.currentUser = null;
            updateAuthNav();
        }
    }

    // --- Helpers and Renderers for Account Dashboard ---

    function formatIsoDateTime(isoStr) {
        if (!isoStr) return '—';
        try {
            const d = new Date(isoStr);
            if (isNaN(d.getTime())) return isoStr;
            return d.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (e) {
            return isoStr;
        }
    }

    function getBookingStatusClass(status) {
        const s = (status || '').toUpperCase();
        if (s === 'CONFIRMED') return 'status-confirmed';
        if (s === 'PENDING' || s === 'PENDING_PAYMENT') return 'status-pending';
        if (s === 'CANCELLED') return 'status-cancelled';
        if (s === 'REFUNDED') return 'status-expired';
        return 'status-confirmed';
    }

    function getInquiryStatusClass(status) {
        const s = (status || '').toUpperCase();
        if (s === 'CONFIRMED') return 'status-confirmed';
        if (s === 'UNDER_REVIEW') return 'status-review';
        if (s === 'QUOTED') return 'status-quoted';
        if (s === 'PENDING') return 'status-pending';
        if (s === 'REJECTED') return 'status-cancelled';
        if (s === 'EXPIRED') return 'status-expired';
        return 'status-pending';
    }

    function closeAccountDetailsModal() {
        if (!dom.accountDetailsModal) return;
        dom.accountDetailsModal.classList.remove('is-open', 'show');
        dom.accountDetailsModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    }

    function openBookingDetailsModal(bookingCode) {
        if (!dom.accountDetailsModal || !dom.accountDetailsModalBody) return;
        const booking = (state.myBookings || []).find(b => b.bookingCode === bookingCode);
        if (!booking) {
            showToast('Booking details not found.');
            return;
        }

        const eventImg = resolveEventImage({
            code: booking.eventCode,
            title: booking.eventTitle
        });

        const statusClass = getBookingStatusClass(booking.status);
        const formattedDate = formatIsoDateTime(booking.bookingTime);

        dom.accountDetailsModalBody.innerHTML = `
            <div class="receipt-header-row">
                <h3 class="receipt-title">Ticket Booking Receipt</h3>
                <span class="status-badge ${statusClass}">${escapeHtml(booking.status || 'CONFIRMED')}</span>
            </div>

            <div class="receipt-banner-card">
                <img src="${eventImg}" alt="${escapeHtml(booking.eventTitle || 'Event')}" class="receipt-banner-img">
                <div class="receipt-banner-info">
                    <h4>${escapeHtml(booking.eventTitle || 'Event')}</h4>
                    <div class="receipt-banner-meta">📅 ${escapeHtml(booking.eventDateTime || 'Date TBA')}</div>
                    <div class="receipt-banner-meta">📍 ${escapeHtml(booking.eventVenue ? `${booking.eventVenue}, ${booking.eventCity || ''}` : (booking.eventCity || 'Venue TBA'))}</div>
                </div>
            </div>

            <table class="receipt-table">
                <tbody>
                    <tr>
                        <td class="receipt-td-label">Booking Reference</td>
                        <td class="receipt-td-val" style="font-family:var(--font-mono);font-weight:700;color:var(--primary);">${escapeHtml(booking.bookingCode)}</td>
                    </tr>
                    <tr>
                        <td class="receipt-td-label">Attendee Name</td>
                        <td class="receipt-td-val">${escapeHtml(booking.customerName || '—')}</td>
                    </tr>
                    <tr>
                        <td class="receipt-td-label">Contact Email</td>
                        <td class="receipt-td-val">${escapeHtml(booking.customerEmail || '—')}</td>
                    </tr>
                    ${booking.customerPhone ? `
                    <tr>
                        <td class="receipt-td-label">Contact Phone</td>
                        <td class="receipt-td-val">${escapeHtml(booking.customerPhone)}</td>
                    </tr>` : ''}
                    <tr>
                        <td class="receipt-td-label">Ticket Tier</td>
                        <td class="receipt-td-val">${escapeHtml(booking.ticketTier || 'General Admission')}</td>
                    </tr>
                    <tr>
                        <td class="receipt-td-label">Quantity</td>
                        <td class="receipt-td-val">${booking.quantity || 1} Tickets</td>
                    </tr>
                    <tr>
                        <td class="receipt-td-label">Unit Price</td>
                        <td class="receipt-td-val">${inrFormatter.format(booking.unitPrice || 0)}</td>
                    </tr>
                    <tr style="border-top: 2px solid var(--border-color);">
                        <td class="receipt-td-label" style="font-weight:700;color:var(--text-primary);font-size:1.05rem;">Total Amount Paid</td>
                        <td class="receipt-td-val" style="font-size:1.2rem;font-weight:800;color:var(--primary);">${inrFormatter.format(booking.totalAmount || 0)}</td>
                    </tr>
                    <tr>
                        <td class="receipt-td-label">Booked On</td>
                        <td class="receipt-td-val">${escapeHtml(formattedDate)}</td>
                    </tr>
                    ${booking.notes ? `
                    <tr>
                        <td class="receipt-td-label">Notes</td>
                        <td class="receipt-td-val">${escapeHtml(booking.notes)}</td>
                    </tr>` : ''}
                </tbody>
            </table>

            <div class="receipt-qr-card">
                <div style="font-size:1.8rem;">📱</div>
                <div class="receipt-qr-code">${escapeHtml(booking.qrCodePayload || booking.bookingCode)}</div>
                <p class="receipt-qr-note">Scan this digital pass QR code at venue security gate for verified admission check-in.</p>
            </div>

            <div style="text-align:center;margin-top:1.25rem;">
                <button type="button" class="btn btn-outline btn-sm" id="btn-close-account-modal">Close Receipt</button>
            </div>
        `;

        const closeBtn = dom.accountDetailsModalBody.querySelector('#btn-close-account-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeAccountDetailsModal);
        }

        dom.accountDetailsModal.classList.add('is-open', 'show');
        dom.accountDetailsModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    }

    function openInquiryDetailsModal(inquiryCode) {
        if (!dom.accountDetailsModal || !dom.accountDetailsModalBody) return;
        const inquiry = (state.myInquiries || []).find(i => i.inquiryCode === inquiryCode);
        if (!inquiry) {
            showToast('Venue inquiry details not found.');
            return;
        }

        const venueImg = resolveVenueImage({
            code: inquiry.venueCode,
            name: inquiry.venueName
        });

        const statusClass = getInquiryStatusClass(inquiry.status);
        const formattedDate = formatIsoDateTime(inquiry.inquiryTime);

        dom.accountDetailsModalBody.innerHTML = `
            <div class="receipt-header-row">
                <h3 class="receipt-title">Venue Inquiry Summary</h3>
                <span class="status-badge ${statusClass}">${escapeHtml(inquiry.status || 'PENDING')}</span>
            </div>

            <div class="receipt-banner-card">
                <img src="${venueImg}" alt="${escapeHtml(inquiry.venueName || 'Venue')}" class="receipt-banner-img">
                <div class="receipt-banner-info">
                    <h4>${escapeHtml(inquiry.venueName || 'Venue')}</h4>
                    <div class="receipt-banner-meta">📍 ${escapeHtml(inquiry.venueLocation ? `${inquiry.venueLocation}, ${inquiry.venueCity || ''}` : (inquiry.venueCity || 'City TBA'))}</div>
                    <div class="receipt-banner-meta">🏷️ Event Type: ${escapeHtml(inquiry.eventType || 'Rental')}</div>
                </div>
            </div>

            <table class="receipt-table">
                <tbody>
                    <tr>
                        <td class="receipt-td-label">Inquiry Reference</td>
                        <td class="receipt-td-val" style="font-family:var(--font-mono);font-weight:700;color:var(--primary);">${escapeHtml(inquiry.inquiryCode)}</td>
                    </tr>
                    <tr>
                        <td class="receipt-td-label">Primary Contact</td>
                        <td class="receipt-td-val">${escapeHtml(inquiry.contactName || '—')}</td>
                    </tr>
                    <tr>
                        <td class="receipt-td-label">Contact Details</td>
                        <td class="receipt-td-val">${escapeHtml(inquiry.contactPhoneEmail || '—')}</td>
                    </tr>
                    <tr>
                        <td class="receipt-td-label">Requested Date</td>
                        <td class="receipt-td-val">${escapeHtml(inquiry.requestedDate || 'Date TBA')}</td>
                    </tr>
                    <tr>
                        <td class="receipt-td-label">Expected Attendance</td>
                        <td class="receipt-td-val">${escapeHtml(inquiry.expectedAttendance || 'TBA')}</td>
                    </tr>
                    <tr>
                        <td class="receipt-td-label">Rental Duration</td>
                        <td class="receipt-td-val">${escapeHtml(inquiry.rentalDuration || 'Full Day')}</td>
                    </tr>
                    <tr style="border-top: 2px solid var(--border-color);">
                        <td class="receipt-td-label" style="font-weight:700;color:var(--text-primary);font-size:1.05rem;">Estimated Quotation</td>
                        <td class="receipt-td-val" style="font-size:1.2rem;font-weight:800;color:var(--primary);">${inrFormatter.format(inquiry.estimatedQuote || 0)}</td>
                    </tr>
                    <tr>
                        <td class="receipt-td-label">Submitted On</td>
                        <td class="receipt-td-val">${escapeHtml(formattedDate)}</td>
                    </tr>
                    ${inquiry.notes ? `
                    <tr>
                        <td class="receipt-td-label">Special Requirements</td>
                        <td class="receipt-td-val">${escapeHtml(inquiry.notes)}</td>
                    </tr>` : ''}
                </tbody>
            </table>

            <div style="text-align:center;margin-top:1.25rem;">
                <button type="button" class="btn btn-outline btn-sm" id="btn-close-account-modal">Close Summary</button>
            </div>
        `;

        const closeBtn = dom.accountDetailsModalBody.querySelector('#btn-close-account-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeAccountDetailsModal);
        }

        dom.accountDetailsModal.classList.add('is-open', 'show');
        dom.accountDetailsModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    }

    async function fetchMyBookings(force = false) {
        if (!dom.myTicketsList) return;
        if (state.myBookingsLoading) return;

        state.myBookingsLoading = true;
        if (dom.myTicketsLoading) dom.myTicketsLoading.style.display = 'flex';
        if (dom.myTicketsError) dom.myTicketsError.style.display = 'none';
        if (dom.myTicketsEmpty) dom.myTicketsEmpty.style.display = 'none';
        dom.myTicketsList.innerHTML = '';

        try {
            const res = await apiClient.get('/api/bookings/my');
            state.myBookingsLoading = false;
            if (dom.myTicketsLoading) dom.myTicketsLoading.style.display = 'none';

            const bookings = (res && res.data) ? res.data : [];
            state.myBookings = bookings;
            if (dom.badgeTicketsCount) dom.badgeTicketsCount.textContent = bookings.length;

            if (bookings.length === 0) {
                if (dom.myTicketsEmpty) dom.myTicketsEmpty.style.display = 'block';
                return;
            }

            dom.myTicketsList.innerHTML = bookings.map(b => {
                const img = resolveEventImage({ code: b.eventCode, title: b.eventTitle });
                const statusCls = getBookingStatusClass(b.status);
                const bookedOn = formatIsoDateTime(b.bookingTime);
                return `
                    <div class="my-booking-card" data-code="${escapeHtml(b.bookingCode)}">
                        <div class="booking-card-media">
                            <img src="${img}" alt="${escapeHtml(b.eventTitle || 'Event')}" class="booking-card-img" loading="lazy">
                            <span class="status-badge ${statusCls}">${escapeHtml(b.status || 'CONFIRMED')}</span>
                        </div>
                        <div class="booking-card-body">
                            <div class="booking-card-header-row">
                                <span class="booking-ref-code">${escapeHtml(b.bookingCode)}</span>
                                <span class="booking-meta-date">${escapeHtml(bookedOn)}</span>
                            </div>
                            <h3 class="booking-card-title">${escapeHtml(b.eventTitle || 'Event')}</h3>
                            <div class="booking-card-specs">
                                <div class="booking-spec-row">
                                    <span class="spec-icon">📅</span>
                                    <span>${escapeHtml(b.eventDateTime || 'Date TBA')}</span>
                                </div>
                                <div class="booking-spec-row">
                                    <span class="spec-icon">📍</span>
                                    <span>${escapeHtml(b.eventVenue ? `${b.eventVenue}, ${b.eventCity || ''}` : (b.eventCity || 'Venue TBA'))}</span>
                                </div>
                                <div class="booking-spec-row">
                                    <span class="spec-icon">🎟️</span>
                                    <span>${b.quantity} × ${escapeHtml(b.ticketTier || 'General Admission')}</span>
                                </div>
                            </div>
                            <div class="booking-card-footer">
                                <div class="booking-card-price">
                                    <span class="price-label">Total Paid</span>
                                    <span class="price-val">${inrFormatter.format(b.totalAmount || 0)}</span>
                                </div>
                                <button class="btn btn-outline btn-sm btn-view-ticket-receipt" data-code="${escapeHtml(b.bookingCode)}" type="button">
                                    <span>View Receipt</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            dom.myTicketsList.querySelectorAll('.btn-view-ticket-receipt').forEach(btn => {
                btn.addEventListener('click', () => {
                    const code = btn.getAttribute('data-code');
                    openBookingDetailsModal(code);
                });
            });

        } catch (err) {
            state.myBookingsLoading = false;
            console.error('[VenueVista] Failed to fetch user bookings:', err);
            if (dom.myTicketsLoading) dom.myTicketsLoading.style.display = 'none';
            if (dom.myTicketsError) {
                dom.myTicketsError.style.display = 'block';
                const txt = document.getElementById('my-tickets-error-text');
                if (txt) txt.textContent = "Couldn't load tickets. Please try again.";
            }
        }
    }

    async function fetchMyInquiries(force = false) {
        if (!dom.myInquiriesList) return;
        if (state.myInquiriesLoading) return;

        state.myInquiriesLoading = true;
        if (dom.myInquiriesLoading) dom.myInquiriesLoading.style.display = 'flex';
        if (dom.myInquiriesError) dom.myInquiriesError.style.display = 'none';
        if (dom.myInquiriesEmpty) dom.myInquiriesEmpty.style.display = 'none';
        dom.myInquiriesList.innerHTML = '';

        try {
            const res = await apiClient.get('/api/venues/inquiries/my');
            state.myInquiriesLoading = false;
            if (dom.myInquiriesLoading) dom.myInquiriesLoading.style.display = 'none';

            const inquiries = (res && res.data) ? res.data : [];
            state.myInquiries = inquiries;
            if (dom.badgeInquiriesCount) dom.badgeInquiriesCount.textContent = inquiries.length;

            if (inquiries.length === 0) {
                if (dom.myInquiriesEmpty) dom.myInquiriesEmpty.style.display = 'block';
                return;
            }

            dom.myInquiriesList.innerHTML = inquiries.map(i => {
                const img = resolveVenueImage({ code: i.venueCode, name: i.venueName });
                const statusCls = getInquiryStatusClass(i.status);
                const submittedOn = formatIsoDateTime(i.inquiryTime);
                return `
                    <div class="my-inquiry-card" data-code="${escapeHtml(i.inquiryCode)}">
                        <div class="booking-card-media">
                            <img src="${img}" alt="${escapeHtml(i.venueName || 'Venue')}" class="booking-card-img" loading="lazy">
                            <span class="status-badge ${statusCls}">${escapeHtml(i.status || 'PENDING')}</span>
                        </div>
                        <div class="booking-card-body">
                            <div class="booking-card-header-row">
                                <span class="booking-ref-code">${escapeHtml(i.inquiryCode)}</span>
                                <span class="booking-meta-date">${escapeHtml(submittedOn)}</span>
                            </div>
                            <h3 class="booking-card-title">${escapeHtml(i.venueName || 'Venue')}</h3>
                            <div class="booking-card-specs">
                                <div class="booking-spec-row">
                                    <span class="spec-icon">📅</span>
                                    <span>Requested: ${escapeHtml(i.requestedDate || 'Date TBA')}</span>
                                </div>
                                <div class="booking-spec-row">
                                    <span class="spec-icon">📍</span>
                                    <span>${escapeHtml(i.venueLocation ? `${i.venueLocation}, ${i.venueCity || ''}` : (i.venueCity || 'City TBA'))}</span>
                                </div>
                                <div class="booking-spec-row">
                                    <span class="spec-icon">👥</span>
                                    <span>${escapeHtml(i.expectedAttendance || 'TBA')} • ${escapeHtml(i.rentalDuration || 'Full Day')}</span>
                                </div>
                                <div class="booking-spec-row">
                                    <span class="spec-icon">🏷️</span>
                                    <span>Event: ${escapeHtml(i.eventType || 'Rental')}</span>
                                </div>
                            </div>
                            <div class="booking-card-footer">
                                <div class="booking-card-price">
                                    <span class="price-label">Estimated Quote</span>
                                    <span class="price-val">${inrFormatter.format(i.estimatedQuote || 0)}</span>
                                </div>
                                <button class="btn btn-outline btn-sm btn-view-inquiry-receipt" data-code="${escapeHtml(i.inquiryCode)}" type="button">
                                    <span>View Details</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            dom.myInquiriesList.querySelectorAll('.btn-view-inquiry-receipt').forEach(btn => {
                btn.addEventListener('click', () => {
                    const code = btn.getAttribute('data-code');
                    openInquiryDetailsModal(code);
                });
            });

        } catch (err) {
            state.myInquiriesLoading = false;
            console.error('[VenueVista] Failed to fetch user inquiries:', err);
            if (dom.myInquiriesLoading) dom.myInquiriesLoading.style.display = 'none';
            if (dom.myInquiriesError) {
                dom.myInquiriesError.style.display = 'block';
                const txt = document.getElementById('my-inquiries-error-text');
                if (txt) txt.textContent = "Couldn't load inquiries. Please try again.";
            }
        }
    }

    function switchBookingsTab(tabName) {
        const isTickets = tabName !== 'inquiries';
        if (dom.tabBtnTickets) {
            dom.tabBtnTickets.classList.toggle('active', isTickets);
            dom.tabBtnTickets.setAttribute('aria-selected', isTickets ? 'true' : 'false');
        }
        if (dom.tabBtnInquiries) {
            dom.tabBtnInquiries.classList.toggle('active', !isTickets);
            dom.tabBtnInquiries.setAttribute('aria-selected', !isTickets ? 'true' : 'false');
        }
        if (dom.paneMyTickets) dom.paneMyTickets.style.display = isTickets ? 'block' : 'none';
        if (dom.paneMyInquiries) dom.paneMyInquiries.style.display = !isTickets ? 'block' : 'none';

        try {
            window.history.replaceState(null, '', `/my-bookings?tab=${isTickets ? 'tickets' : 'inquiries'}`);
        } catch (e) {}

        if (isTickets) {
            fetchMyBookings();
        } else {
            fetchMyInquiries();
        }
    }

    function renderMyBookingsPage(tabParam) {
        const tab = (tabParam || '').toLowerCase() === 'inquiries' ? 'inquiries' : 'tickets';
        switchBookingsTab(tab);
    }

    function renderMyProfilePage() {
        if (!state.currentUser) return;
        const initial = (state.currentUser.name || 'U').charAt(0).toUpperCase();
        const avatarEl = document.getElementById('profile-avatar-display');
        const nameDisplay = document.getElementById('profile-name-display');
        const roleDisplay = document.getElementById('profile-role-display');
        const valName = document.getElementById('profile-val-name');
        const valEmail = document.getElementById('profile-val-email');
        const valPhone = document.getElementById('profile-val-phone');
        const valRole = document.getElementById('profile-val-role');
        const valId = document.getElementById('profile-val-id');

        if (avatarEl) avatarEl.textContent = initial;
        if (nameDisplay) nameDisplay.textContent = state.currentUser.name || 'User';
        if (roleDisplay) roleDisplay.textContent = state.currentUser.role || 'ROLE_USER';
        if (valName) valName.textContent = state.currentUser.name || '—';
        if (valEmail) valEmail.textContent = state.currentUser.email || '—';
        if (valPhone) valPhone.textContent = state.currentUser.phone || 'Not provided';
        if (valRole) valRole.textContent = state.currentUser.role || 'ROLE_USER';
        if (valId) valId.textContent = state.currentUser.id ? `#VV-USR-${state.currentUser.id}` : '#VV-DEMO-01';
    }

    function renderAccountSettingsPage() {
        if (!state.currentUser) return;
        const sessionDesc = document.getElementById('settings-session-desc');
        if (sessionDesc) {
            sessionDesc.textContent = `Logged in as ${state.currentUser.name} (${state.currentUser.email}).`;
        }

        const darkCard = document.getElementById('theme-card-dark');
        const lightCard = document.getElementById('theme-card-light');
        const checkDark = document.getElementById('theme-check-dark');
        const checkLight = document.getElementById('theme-check-light');

        const isDark = state.theme === 'dark';
        if (darkCard) darkCard.classList.toggle('selected', isDark);
        if (lightCard) lightCard.classList.toggle('selected', !isDark);
        if (checkDark) checkDark.style.display = isDark ? 'inline-block' : 'none';
        if (checkLight) checkLight.style.display = !isDark ? 'inline-block' : 'none';
    }

    async function loadCategoriesAndCities() {
        // Fetch categories and cities from backend in parallel
        state.categoriesLoading = true;
        try {
            const [eventsCatRes, venuesCatRes, citiesRes] = await Promise.allSettled([
                apiClient.get('/api/events/categories'),
                apiClient.get('/api/venues/categories'),
                apiClient.get('/api/venues/cities')
            ]);

            if (eventsCatRes.status === 'fulfilled' && eventsCatRes.value && eventsCatRes.value.data) {
                state.eventCategories = eventsCatRes.value.data.map(cat => ({
                    ...cat,
                    icon: resolveEventIcon(cat),
                    badgeClass: resolveEventBadgeClass(cat),
                    image: resolveCategoryImage(cat)
                }));
            }

            if (venuesCatRes.status === 'fulfilled' && venuesCatRes.value && venuesCatRes.value.data) {
                state.venueCategories = venuesCatRes.value.data.map(vc => ({
                    ...vc,
                    icon: resolveVenueIcon(vc),
                    badgeClass: resolveVenueBadgeClass(vc),
                    image: resolveVenueImage(vc)
                }));
            }

            if (citiesRes.status === 'fulfilled' && citiesRes.value && citiesRes.value.data) {
                state.venueCities = citiesRes.value.data;
                // Populate city select filter dropdowns
                const citySelects = [dom.venuesCitySelect, dom.allVenuesCitySelect].filter(Boolean);
                citySelects.forEach(sel => {
                    const currentVal = sel.value;
                    let opts = '<option value="">All Metro Cities</option>';
                    state.venueCities.forEach(city => {
                        opts += `<option value="${escapeHtml(city)}" ${currentVal === city ? 'selected' : ''}>${escapeHtml(city)}</option>`;
                    });
                    sel.innerHTML = opts;
                });
            }
        } catch (err) {
            console.warn('[VenueVista] Non-critical metadata initialization error:', err);
        } finally {
            state.categoriesLoading = false;
            if (state.currentRoute === 'events-categories') {
                renderEventsFullCategories();
            } else if (state.currentRoute === 'venues-categories') {
                renderVenuesFullCategories();
            }
        }
    }

    function showToast(message) {
        if (!dom.toast || !dom.toastMessage) return;
        dom.toastMessage.textContent = message;
        dom.toast.classList.add('show');
        if (state.toastTimeout) clearTimeout(state.toastTimeout);
        state.toastTimeout = setTimeout(() => {
            dom.toast.classList.remove('show');
        }, 2600);
    }

    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Bind all global and interactive event listeners
     */
    function bindEvents() {
        // Theme toggle
        if (dom.themeToggleBtn) {
            dom.themeToggleBtn.addEventListener('click', toggleTheme);
        }

        // Mobile menu toggle
        if (dom.mobileMenuToggle && dom.headerNavWrapper) {
            dom.mobileMenuToggle.addEventListener('click', () => {
                const isOpen = dom.headerNavWrapper.classList.toggle('is-open');
                dom.mobileMenuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });
        }

        // Global Client-Side Routing Click Interceptor
        // Ensures internal links use client-side routing (pushState) rather than reloading the document
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href) return;

            // Ignore external links, mailto, tel, target=_blank
            if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank') {
                return;
            }

            // In-page hash jump on same route
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth' });
                }
                return;
            }

            // Internal link navigation
            e.preventDefault();
            navigateTo(href);
        });

        // Popstate listener for browser Back and Forward navigation
        window.addEventListener('popstate', handleRoute);

        // Explore Events Filter Controls
        const eventSearchEl = dom.eventsSearchQuery || dom.allEventsSearchQuery;
        if (eventSearchEl) {
            eventSearchEl.addEventListener('input', (e) => {
                state.eventSearchQuery = e.target.value.trim();
                applyEventFilters();
            });
        }

        const eventCatSelectEl = dom.eventsCategorySelect || dom.allEventsCategorySelect;
        if (eventCatSelectEl) {
            eventCatSelectEl.addEventListener('change', (e) => {
                const selectedVal = e.target.value;
                const cats = (state.eventCategories && state.eventCategories.length) ? state.eventCategories : EVENT_CATEGORIES;
                const catObj = cats.find(c => c.key.toLowerCase() === selectedVal.toLowerCase());
                if (catObj) {
                    navigateTo(`/events/${catObj.slug}`);
                } else {
                    navigateTo('/events/all');
                }
            });
        }

        const eventSearchBtn = dom.btnEventsSearchTrigger || dom.btnAllEventsSearchTrigger;
        if (eventSearchBtn) {
            eventSearchBtn.addEventListener('click', () => {
                applyEventFilters();
            });
        }

        const resetEvents = () => {
            state.eventSearchQuery = '';
            if (eventSearchEl) eventSearchEl.value = '';
            navigateTo('/events/all');
        };

        const eventResetBtn = dom.btnEventsReset || dom.btnAllEventsReset;
        if (eventResetBtn) eventResetBtn.addEventListener('click', resetEvents);

        const eventEmptyResetBtn = dom.btnEventsEmptyReset || dom.btnAllEventsEmptyReset;
        if (eventEmptyResetBtn) eventEmptyResetBtn.addEventListener('click', resetEvents);

        // Explore Venues Filter Controls
        const venueCatSelectEl = dom.venuesCategorySelect || dom.allVenuesCategorySelect;
        if (venueCatSelectEl) {
            venueCatSelectEl.addEventListener('change', (e) => {
                const selectedVal = e.target.value;
                const cats = (state.venueCategories && state.venueCategories.length) ? state.venueCategories : VENUE_CATEGORIES;
                const vObj = cats.find(c => c.key.toLowerCase() === selectedVal.toLowerCase());
                if (vObj) {
                    navigateTo(`/venues/${vObj.slug}`);
                } else {
                    navigateTo('/venues/all');
                }
            });
        }

        const venueCitySelectEl = dom.venuesCitySelect || dom.allVenuesCitySelect;
        if (venueCitySelectEl) {
            venueCitySelectEl.addEventListener('change', (e) => {
                state.activeVenueCity = e.target.value;
                applyVenueFilters();
            });
        }

        const venueSearchEl = dom.venuesSearchInput || dom.allVenuesSearchInput;
        if (venueSearchEl) {
            venueSearchEl.addEventListener('input', (e) => {
                state.venueSearchQuery = e.target.value.trim();
                applyVenueFilters();
            });
        }

        const venueApplyBtn = dom.btnVenuesApply || dom.btnAllVenuesApply;
        if (venueApplyBtn) {
            venueApplyBtn.addEventListener('click', () => {
                applyVenueFilters();
            });
        }

        const resetVenues = () => {
            state.venueSearchQuery = '';
            state.activeVenueCity = '';
            if (venueSearchEl) venueSearchEl.value = '';
            if (venueCitySelectEl) venueCitySelectEl.value = '';
            navigateTo('/venues/all');
        };

        const venueResetBtn = dom.btnVenuesReset || dom.btnAllVenuesResetBtn;
        if (venueResetBtn) venueResetBtn.addEventListener('click', resetVenues);

        const venueEmptyResetBtn = dom.btnVenuesEmptyReset || dom.btnAllVenuesEmptyReset;
        if (venueEmptyResetBtn) venueEmptyResetBtn.addEventListener('click', resetVenues);

        // Auth Modal Controls
        if (dom.btnLogin) dom.btnLogin.addEventListener('click', () => openAuthModal('login'));
        if (dom.btnRegister) dom.btnRegister.addEventListener('click', () => openAuthModal('register'));
        if (dom.authModalCloseBtn) dom.authModalCloseBtn.addEventListener('click', closeAuthModal);
        if (dom.authModalOkBtn) dom.authModalOkBtn.addEventListener('click', closeAuthModal);
        if (dom.authModal) {
            dom.authModal.addEventListener('click', (e) => {
                if (e.target === dom.authModal) closeAuthModal();
            });
        }

        if (dom.authTabLogin) {
            dom.authTabLogin.addEventListener('click', () => switchAuthTab('login'));
        }
        if (dom.authTabRegister) {
            dom.authTabRegister.addEventListener('click', () => switchAuthTab('register'));
        }

        if (dom.btnAuthQuickFill) {
            dom.btnAuthQuickFill.addEventListener('click', () => {
                const em = document.getElementById('login-email');
                const pw = document.getElementById('login-password');
                if (em) em.value = 'demo@venuevista.in';
                if (pw) pw.value = 'DemoUser@2026';
            });
        }

        if (dom.formAuthLogin) {
            dom.formAuthLogin.addEventListener('submit', handleLoginSubmit);
        }

        // Dual OTP Registration Listeners
        const regStep1 = document.getElementById('reg-step-1');
        if (regStep1) regStep1.addEventListener('submit', handleRegistrationStart);

        const regStep2 = document.getElementById('reg-step-2');
        if (regStep2) regStep2.addEventListener('submit', handleVerifyEmailOtp);

        const regStep3 = document.getElementById('reg-step-3');
        if (regStep3) regStep3.addEventListener('submit', handleVerifyPhoneOtp);

        const btnFillEmailOtp = document.getElementById('btn-fill-email-otp');
        if (btnFillEmailOtp) {
            btnFillEmailOtp.addEventListener('click', () => {
                const valElem = document.getElementById('demo-email-otp-val');
                const inputElem = document.getElementById('reg-email-otp');
                if (valElem && inputElem && valElem.textContent && valElem.textContent !== '------') {
                    inputElem.value = valElem.textContent.trim();
                    inputElem.focus();
                }
            });
        }

        const btnFillPhoneOtp = document.getElementById('btn-fill-phone-otp');
        if (btnFillPhoneOtp) {
            btnFillPhoneOtp.addEventListener('click', () => {
                const valElem = document.getElementById('demo-phone-otp-val');
                const inputElem = document.getElementById('reg-phone-otp');
                if (valElem && inputElem && valElem.textContent && valElem.textContent !== '------') {
                    inputElem.value = valElem.textContent.trim();
                    inputElem.focus();
                }
            });
        }

        const btnResendEmailOtp = document.getElementById('btn-resend-email-otp');
        if (btnResendEmailOtp) {
            btnResendEmailOtp.addEventListener('click', () => handleResendOtp('EMAIL'));
        }

        const btnResendPhoneOtp = document.getElementById('btn-resend-phone-otp');
        if (btnResendPhoneOtp) {
            btnResendPhoneOtp.addEventListener('click', () => handleResendOtp('PHONE'));
        }

        const btnBackStep1 = document.getElementById('btn-back-step1');
        if (btnBackStep1) {
            btnBackStep1.addEventListener('click', () => setRegistrationStep(1));
        }

        const btnRegGoLogin = document.getElementById('btn-reg-go-login');
        if (btnRegGoLogin) {
            btnRegGoLogin.addEventListener('click', () => {
                switchAuthTab('login');
                resetRegistrationWizard();
            });
        }

        // Event Modal Controls
        if (dom.modalCloseBtn) dom.modalCloseBtn.addEventListener('click', closeEventModal);
        if (dom.modalCloseAction) dom.modalCloseAction.addEventListener('click', closeEventModal);
        if (dom.eventModal) {
            dom.eventModal.addEventListener('click', (e) => {
                if (e.target === dom.eventModal) closeEventModal();
            });
        }

        if (dom.bookingTicketTier) {
            dom.bookingTicketTier.addEventListener('change', updateBookingTotal);
        }
        if (dom.bookingQuantity) {
            dom.bookingQuantity.addEventListener('change', updateBookingTotal);
        }

        if (dom.eventBookingForm) {
            dom.eventBookingForm.addEventListener('submit', handleEventBookingSubmit);
        }

        if (dom.btnBookingAnother) {
            dom.btnBookingAnother.addEventListener('click', () => {
                if (dom.eventBookingSection) dom.eventBookingSection.style.display = 'block';
                if (dom.eventBookingConfirmation) dom.eventBookingConfirmation.style.display = 'none';
                if (state.selectedEvent) {
                    updateModalAvailability(state.selectedEvent);
                }
            });
        }
        if (dom.btnBookingDone) {
            dom.btnBookingDone.addEventListener('click', closeEventModal);
        }

        // Venue Modal Controls
        if (dom.venueModalCloseBtn) dom.venueModalCloseBtn.addEventListener('click', closeVenueModal);
        if (dom.venueModalCloseAction) dom.venueModalCloseAction.addEventListener('click', closeVenueModal);
        if (dom.venueModal) {
            dom.venueModal.addEventListener('click', (e) => {
                if (e.target === dom.venueModal) closeVenueModal();
            });
        }

        if (dom.venueInquiryForm) {
            dom.venueInquiryForm.addEventListener('submit', handleVenueInquirySubmit);
        }

        if (dom.btnInquiryAnother) {
            dom.btnInquiryAnother.addEventListener('click', () => {
                if (dom.venueInquiryForm) dom.venueInquiryForm.style.display = 'flex';
                if (dom.venueInquiryConfirmation) dom.venueInquiryConfirmation.style.display = 'none';
            });
        }
        if (dom.btnInquiryDone) {
            dom.btnInquiryDone.addEventListener('click', closeVenueModal);
        }

        // Account Details Modal Controls
        if (dom.accountDetailsModalCloseBtn) {
            dom.accountDetailsModalCloseBtn.addEventListener('click', closeAccountDetailsModal);
        }
        if (dom.accountDetailsModal) {
            dom.accountDetailsModal.addEventListener('click', (e) => {
                if (e.target === dom.accountDetailsModal) closeAccountDetailsModal();
            });
        }

        // My Bookings Tab Buttons & Retry Handlers
        if (dom.tabBtnTickets) {
            dom.tabBtnTickets.addEventListener('click', () => switchBookingsTab('tickets'));
        }
        if (dom.tabBtnInquiries) {
            dom.tabBtnInquiries.addEventListener('click', () => switchBookingsTab('inquiries'));
        }
        if (dom.btnRetryTickets) {
            dom.btnRetryTickets.addEventListener('click', () => fetchMyBookings(true));
        }
        if (dom.btnRetryInquiries) {
            dom.btnRetryInquiries.addEventListener('click', () => fetchMyInquiries(true));
        }

        // Account Settings Theme Toggles & Signout
        const darkThemeCard = document.getElementById('theme-card-dark');
        const lightThemeCard = document.getElementById('theme-card-light');
        if (darkThemeCard) {
            darkThemeCard.addEventListener('click', () => {
                setTheme('dark', true);
                renderAccountSettingsPage();
                showToast('Mode switched to Midnight Glow');
            });
        }
        if (lightThemeCard) {
            lightThemeCard.addEventListener('click', () => {
                setTheme('light', true);
                renderAccountSettingsPage();
                showToast('Mode switched to Aurora View');
            });
        }
        const btnSettingsSignout = document.getElementById('btn-settings-signout');
        if (btnSettingsSignout) {
            btnSettingsSignout.addEventListener('click', handleLogout);
        }

        // Close account dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const menuWrapper = document.getElementById('account-menu-wrapper');
            if (menuWrapper && !menuWrapper.contains(e.target)) {
                closeAccountDropdown();
            }
        });

        // Global Escape closes any open modal or dropdown
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeEventModal();
                closeVenueModal();
                closeAuthModal();
                closeAccountDetailsModal();
                closeAccountDropdown();
            }
        });
    }

    /**
     * Application Initialization
     */
    async function init() {
        console.log(`[${CONFIG.appName}] Initializing v${CONFIG.version} (Integrated with Spring Boot API at ${CONFIG.apiBaseUrl})`);
        cacheDom();
        initTheme();
        bindEvents();

        // Restore auth session & fetch metadata asynchronously
        initAuthSession();
        loadCategoriesAndCities();

        // Handle initial route from address bar
        handleRoute();
        console.log(`[${CONFIG.appName}] Client-Side Router Active: ${state.currentPath}`);
    }

    // Public API for programmatic testing and verification
    return {
        init,
        config: CONFIG,
        getState: () => ({ ...state }),
        getEventCategories: () => ([...state.eventCategories]),
        getVenueCategories: () => ([...state.venueCategories]),
        getEventsData: () => ([...state.eventsData]),
        getVenuesData: () => ([...state.venuesData]),
        apiClient,
        setTheme,
        toggleTheme,
        navigateTo,
        handleRoute,
        applyEventFilters,
        applyVenueFilters,
        openEventModal,
        openVenueModal,
        openAuthModal,
        handleLogout,
        inrFormatter,
        assetRegistry: ASSET_REGISTRY,
        resolveEventImage,
        resolveCategoryImage,
        resolveVenueImage,
        resolveEventIcon,
        resolveVenueIcon,
        resolveEventBadgeClass,
        resolveVenueBadgeClass,
        createCategoryCardHtml,
        createVenueCategoryCardHtml,
        createEventCardHtml,
        createVenueCardHtml,
        getInventoryBadgeHtml,
        updateModalAvailability,
        switchBookingsTab,
        renderMyBookingsPage,
        renderMyProfilePage,
        renderAccountSettingsPage,
        openBookingDetailsModal,
        openInquiryDetailsModal,
        closeAccountDropdown,
        toggleAccountDropdown,
        fetchMyBookings,
        fetchMyInquiries
    };
})();

// Expose to window for external scripts and router verification
if (typeof window !== 'undefined') {
    window.VenueVista = VenueVista;
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    VenueVista.init();
});
