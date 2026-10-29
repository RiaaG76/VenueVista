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
        apiBaseUrl: (typeof window !== 'undefined' && window.VENUEVISTA_API_URL) ? window.VENUEVISTA_API_URL : 'http://localhost:8081',
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

    // Six Event Categories with dedicated route slugs and descriptions (using local SVG illustrations)
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
            image: '/assets/event-music.svg',
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
            image: '/assets/event-tech.svg',
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
            image: '/assets/event-workshop.svg',
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
            image: '/assets/event-sports.svg',
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
            image: '/assets/event-conference.svg',
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
            image: '/assets/event-theatre.svg',
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
            image: '/assets/categories/music-concert.jpg',
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
            image: '/assets/event-music.svg',
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
            image: '/assets/event-tech.svg',
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
            image: '/assets/event-workshop.svg',
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
            image: '/assets/event-sports.svg',
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
            image: '/assets/event-conference.svg',
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
            image: '/assets/event-theatre.svg',
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
        eventCategories: [],
        venueCategories: [],
        venueCities: [],
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
            dom.viewNotFound
        ].filter(Boolean);

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
        dom.modalEventDescription = document.getElementById('modal-event-description');
        dom.btnModalBook = document.getElementById('btn-modal-book');
        dom.eventBookingSection = document.getElementById('event-booking-section');
        dom.eventBookingForm = document.getElementById('event-booking-form');
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
        // 8. Unknown Route: Not Found
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
        const cats = (state.eventCategories && state.eventCategories.length) ? state.eventCategories : EVENT_CATEGORIES;
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
                if (dom.eventsHeadingTag) dom.eventsHeadingTag.textContent = `${matchedCat.icon} ${matchedCat.title}`;
                dom.eventsHeadingTitle.textContent = `${matchedCat.title} Events in India`;
                dom.eventsHeadingSubtitle.textContent = matchedCat.description;
            } else {
                if (dom.eventsHeadingTag) dom.eventsHeadingTag.textContent = 'Complete Catalog';
                dom.eventsHeadingTitle.textContent = 'All Upcoming Events in India';
                dom.eventsHeadingSubtitle.textContent = 'Browse live curated demonstration events from the Spring Boot API. Search by title, venue, or metro city, and filter by category.';
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
                <p>Loading live events from VenueVista backend...</p>
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
            state.eventsData = events;
            state.eventsLoading = false;

            renderEventsGrid(events);
            syncEventFilterControls(events.length);
        } catch (err) {
            state.eventsLoading = false;
            console.error('[VenueVista] Failed to fetch events from backend:', err);
            grid.style.display = 'grid';
            if (emptyState) emptyState.style.display = 'none';
            grid.innerHTML = `
                <div class="api-error-state">
                    <span class="error-icon" aria-hidden="true">⚠️</span>
                    <h3>Unable to Load Events</h3>
                    <p>${escapeHtml(err.message || 'Could not connect to backend server at ' + CONFIG.apiBaseUrl)}</p>
                    <button class="btn btn-primary btn-sm" id="btn-events-retry" type="button">Retry Connection</button>
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
        const cats = (state.venueCategories && state.venueCategories.length) ? state.venueCategories : VENUE_CATEGORIES;
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
                if (dom.venuesHeadingTag) dom.venuesHeadingTag.textContent = `${matchedVenueCat.icon} ${matchedVenueCat.title}`;
                dom.venuesHeadingTitle.textContent = `${matchedVenueCat.title} in India`;
                dom.venuesHeadingSubtitle.textContent = matchedVenueCat.description;
            } else {
                if (dom.venuesHeadingTag) dom.venuesHeadingTag.textContent = 'All Rental Spaces';
                dom.venuesHeadingTitle.textContent = 'All Demonstration Venues in India';
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
                <p>Loading certified demonstration venues from backend...</p>
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
            state.venuesData = venues;
            state.venuesLoading = false;

            renderVenuesGrid(venues);
            syncVenueFilterControls(venues.length);
        } catch (err) {
            state.venuesLoading = false;
            console.error('[VenueVista] Failed to fetch venues from backend:', err);
            grid.style.display = 'grid';
            if (emptyState) emptyState.style.display = 'none';
            grid.innerHTML = `
                <div class="api-error-state">
                    <span class="error-icon" aria-hidden="true">⚠️</span>
                    <h3>Unable to Load Venues</h3>
                    <p>${escapeHtml(err.message || 'Could not connect to backend server at ' + CONFIG.apiBaseUrl)}</p>
                    <button class="btn btn-primary btn-sm" id="btn-venues-retry" type="button">Retry Connection</button>
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
        return `
            <a href="${escapeHtml(cat.path)}" class="category-card" data-slug="${escapeHtml(cat.slug)}" aria-label="Explore ${escapeHtml(cat.title)}">
                <div class="category-card-media">
                    <img src="${escapeHtml(cat.image)}" alt="${escapeHtml(cat.title)}" class="category-card-image" loading="lazy">
                    <div class="category-badge-floating ${escapeHtml(cat.badgeClass)}">
                        <span>${escapeHtml(cat.icon)} ${escapeHtml(cat.title)}</span>
                    </div>
                </div>
                <div class="category-card-body">
                    <h3 class="category-card-title">${escapeHtml(cat.title)}</h3>
                    <p class="category-card-description">${escapeHtml(cat.tagline)}</p>
                    <div class="category-card-footer">
                        <span class="category-event-count">${cat.eventCount} Events Available</span>
                        <span class="category-explore-link">Explore Category →</span>
                    </div>
                </div>
            </a>
        `;
    }

    function createVenueCategoryCardHtml(vc) {
        return `
            <a href="${escapeHtml(vc.path)}" class="category-card" data-slug="${escapeHtml(vc.slug)}" aria-label="Explore ${escapeHtml(vc.title)}">
                <div class="category-card-media">
                    <img src="${escapeHtml(vc.image)}" alt="${escapeHtml(vc.title)}" class="category-card-image" loading="lazy">
                    <div class="category-badge-floating ${escapeHtml(vc.badgeClass)}">
                        <span>${escapeHtml(vc.icon)} ${escapeHtml(vc.title)}</span>
                    </div>
                </div>
                <div class="category-card-body">
                    <h3 class="category-card-title">${escapeHtml(vc.title)}</h3>
                    <p class="category-card-description">${escapeHtml(vc.tagline)}</p>
                    <div class="category-card-footer">
                        <span class="category-event-count">${vc.venueCount} Venues Available</span>
                        <span class="category-explore-link">Explore Category →</span>
                    </div>
                </div>
            </a>
        `;
    }

    function createEventCardHtml(event) {
        const priceFormatted = inrFormatter.format(event.startingPrice);
        return `
            <article class="event-card" data-event-id="${escapeHtml(event.id)}" tabindex="0" role="article" aria-label="${escapeHtml(event.title)}">
                <div class="event-card-media">
                    <img 
                        src="${escapeHtml(event.image)}" 
                        alt="${escapeHtml(event.title)}" 
                        class="event-card-image"
                        loading="lazy"
                        onerror="this.onerror=null; this.src='/assets/categories/music-concert.jpg';"
                    >
                    <div class="category-badge-floating ${escapeHtml(event.categoryBadgeClass)}">
                        <span>${escapeHtml(event.categoryIcon)} ${escapeHtml(event.category)}</span>
                    </div>
                </div>

                <div class="event-card-body">
                    <div class="event-date-row">
                        <span class="event-date-icon" aria-hidden="true">📅</span>
                        <time class="event-date-text">${escapeHtml(event.dateTime)}</time>
                    </div>

                    <h3 class="event-card-title">${escapeHtml(event.title)}</h3>

                    <div class="event-location-row">
                        <span class="event-location-icon" aria-hidden="true">📍</span>
                        <span class="event-location-text">
                            <strong>${escapeHtml(event.city)}:</strong> ${escapeHtml(event.venue)}
                        </span>
                    </div>

                    <div class="event-card-footer">
                        <div class="event-price-block">
                            <span class="price-label">Tickets From</span>
                            <span class="price-value">${priceFormatted}</span>
                        </div>

                        <button class="btn btn-primary btn-sm btn-view-details" type="button" data-event-id="${escapeHtml(event.id)}">
                            <span>View Details</span>
                        </button>
                    </div>
                </div>
            </article>
        `;
    }

    function createVenueCardHtml(venue) {
        const rentalFormatted = inrFormatter.format(venue.baseRental);
        const amenitiesHtml = venue.amenities.slice(0, 3).map(a => `<span class="venue-tag">${escapeHtml(a)}</span>`).join('');

        return `
            <article class="venue-card" data-venue-id="${escapeHtml(venue.id)}" tabindex="0" role="article" aria-label="${escapeHtml(venue.name)}">
                <div class="venue-card-media">
                    <img 
                        src="${escapeHtml(venue.image)}" 
                        alt="${escapeHtml(venue.name)}" 
                        class="venue-card-image"
                        loading="lazy"
                        onerror="this.onerror=null; this.src='/assets/venue-tech-convention.svg';"
                    >
                    <div class="category-badge-floating ${escapeHtml(venue.categoryBadgeClass || 'badge-auditorium')}">
                        <span>${escapeHtml(venue.categoryIcon || '🏛️')} ${escapeHtml(venue.category)}</span>
                    </div>
                </div>

                <div class="venue-card-body">
                    <div class="venue-location-row">
                        <span class="venue-location-icon" aria-hidden="true">📍</span>
                        <span class="venue-location-text"><strong>${escapeHtml(venue.city)}:</strong> ${escapeHtml(venue.location)}</span>
                    </div>

                    <h3 class="venue-card-title">${escapeHtml(venue.name)}</h3>

                    <p class="venue-card-suitable">
                        <strong>Suitable for:</strong> ${escapeHtml(venue.suitableFor)}
                    </p>

                    <div class="venue-tags-row">
                        ${amenitiesHtml}
                    </div>

                    <div class="venue-specs-grid">
                        <div class="spec-item">
                            <span class="spec-label">Capacity</span>
                            <span class="spec-val">${escapeHtml(venue.capacity)}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Base Rental</span>
                            <span class="spec-val text-primary font-bold">${rentalFormatted} / day</span>
                        </div>
                    </div>

                    <div class="venue-card-footer">
                        <button class="btn btn-outline btn-sm btn-inquire-venue w-full" type="button" data-venue-id="${escapeHtml(venue.id)}">
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
            dom.modalEventImage.src = event.image;
            dom.modalEventImage.alt = event.title;
        }
        if (dom.modalEventCategory) {
            dom.modalEventCategory.textContent = `${event.categoryIcon || '🎟️'} ${event.category}`;
            dom.modalEventCategory.className = `modal-category-badge ${event.categoryBadgeClass || 'badge-music'}`;
        }
        if (dom.modalEventTitle) dom.modalEventTitle.textContent = event.title;
        if (dom.modalEventDate) dom.modalEventDate.textContent = event.dateTime;
        if (dom.modalEventVenue) dom.modalEventVenue.textContent = `${event.venue}, ${event.city}`;
        if (dom.modalEventPrice) dom.modalEventPrice.textContent = `From ${inrFormatter.format(event.startingPrice)}`;
        if (dom.modalEventOrganizer) dom.modalEventOrganizer.textContent = event.organizer;
        if (dom.modalEventDescription) dom.modalEventDescription.textContent = event.description;

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
                state.selectedEvent = { ...event, ...fresh.data };
                event = state.selectedEvent;
                if (dom.modalEventPrice) dom.modalEventPrice.textContent = `From ${inrFormatter.format(event.startingPrice)}`;
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

            // If events grid is rendered, reload events in background so seat counts update
            if (state.currentRoute === 'events-all' || state.currentRoute === 'event-category') {
                applyEventFilters();
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
            dom.venueModalImage.src = venue.image;
            dom.venueModalImage.alt = venue.name;
        }
        if (dom.venueModalBadge) {
            dom.venueModalBadge.textContent = `${venue.categoryIcon || '🏛️'} ${venue.category}`;
            dom.venueModalBadge.className = `modal-category-badge ${venue.categoryBadgeClass || 'badge-auditorium'}`;
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
                state.selectedVenue = { ...venue, ...fresh.data };
                venue = state.selectedVenue;
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

    async function handleRegisterSubmit(e) {
        if (e) e.preventDefault();
        const nameInput = document.getElementById('reg-name');
        const emailInput = document.getElementById('reg-email');
        const phoneInput = document.getElementById('reg-phone');
        const passInput = document.getElementById('reg-password');

        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const phone = phoneInput ? phoneInput.value.trim() : '';
        const password = passInput ? passInput.value : '';

        if (!name || !email || !password) {
            showAuthError('Please fill in name, email, and a password (minimum 6 characters).');
            return;
        }

        const submitBtn = document.getElementById('btn-submit-register');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Creating Account...</span>';
        }

        try {
            await apiClient.post('/api/auth/register', { name, email, phone, password });

            // Automatically authenticate after registration
            const loginRes = await apiClient.post('/api/auth/login', { email, password });
            if (loginRes && loginRes.data && loginRes.data.token) {
                try {
                    localStorage.setItem(CONFIG.tokenStorageKey, loginRes.data.token);
                    localStorage.setItem(CONFIG.userStorageKey, JSON.stringify(loginRes.data.user));
                } catch (storeErr) {
                    console.warn('[VenueVista] Could not store JWT:', storeErr);
                }

                state.currentUser = loginRes.data.user;
                updateAuthNav();
                closeAuthModal();
                showToast(`✓ Account created! Welcome, ${loginRes.data.user.name}!`);
            } else {
                switchAuthTab('login');
                showToast('Registration successful! Please sign in with your credentials.');
            }
        } catch (err) {
            console.error('[VenueVista] Registration failed:', err);
            showAuthError(err.message || 'Registration failed. Email may already be in use.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>Create Account</span>';
            }
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

    function handleLogout() {
        try {
            localStorage.removeItem(CONFIG.tokenStorageKey);
            localStorage.removeItem(CONFIG.userStorageKey);
        } catch (e) {
            console.warn('[VenueVista] Error clearing token:', e);
        }
        state.currentUser = null;
        updateAuthNav();
        showToast('Signed out successfully.');
    }

    function updateAuthNav() {
        const headerActions = dom.headerActions;
        if (!headerActions) return;

        const existingWrapper = document.getElementById('auth-user-wrapper');

        if (state.currentUser) {
            if (dom.btnLogin) dom.btnLogin.style.display = 'none';
            if (dom.btnRegister) dom.btnRegister.style.display = 'none';

            if (!existingWrapper) {
                const userWrapper = document.createElement('div');
                userWrapper.className = 'auth-user-wrapper';
                userWrapper.id = 'auth-user-wrapper';
                const initial = (state.currentUser.name || 'U').charAt(0).toUpperCase();

                userWrapper.innerHTML = `
                    <div class="auth-user-chip" title="${escapeHtml(state.currentUser.email)}">
                        <div class="auth-user-avatar">${escapeHtml(initial)}</div>
                        <span>${escapeHtml(state.currentUser.name)}</span>
                    </div>
                    <button class="btn btn-outline btn-sm" id="btn-logout" type="button">Sign Out</button>
                `;
                headerActions.appendChild(userWrapper);

                const logoutBtn = userWrapper.querySelector('#btn-logout');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', handleLogout);
                }
            } else {
                const chipSpan = existingWrapper.querySelector('.auth-user-chip span');
                const avatar = existingWrapper.querySelector('.auth-user-avatar');
                if (chipSpan) chipSpan.textContent = state.currentUser.name;
                if (avatar) avatar.textContent = (state.currentUser.name || 'U').charAt(0).toUpperCase();
            }
        } else {
            if (existingWrapper) existingWrapper.remove();
            if (dom.btnLogin) dom.btnLogin.style.display = '';
            if (dom.btnRegister) dom.btnRegister.style.display = '';
        }
    }

    async function initAuthSession() {
        let storedToken = null;
        try {
            storedToken = localStorage.getItem(CONFIG.tokenStorageKey);
        } catch (e) {
            console.warn('[VenueVista] Could not read token from storage:', e);
        }

        if (!storedToken) {
            updateAuthNav();
            return;
        }

        try {
            const res = await apiClient.get('/api/auth/me');
            if (res && res.data) {
                state.currentUser = res.data;
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

    async function loadCategoriesAndCities() {
        // Fetch categories and cities from backend in parallel
        try {
            const [eventsCatRes, venuesCatRes, citiesRes] = await Promise.allSettled([
                apiClient.get('/api/events/categories'),
                apiClient.get('/api/venues/categories'),
                apiClient.get('/api/venues/cities')
            ]);

            if (eventsCatRes.status === 'fulfilled' && eventsCatRes.value && eventsCatRes.value.data) {
                state.eventCategories = eventsCatRes.value.data;
            }

            if (venuesCatRes.status === 'fulfilled' && venuesCatRes.value && venuesCatRes.value.data) {
                state.venueCategories = venuesCatRes.value.data;
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
        if (dom.formAuthRegister) {
            dom.formAuthRegister.addEventListener('submit', handleRegisterSubmit);
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

        // Global Escape closes any open modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeEventModal();
                closeVenueModal();
                closeAuthModal();
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
        inrFormatter
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
