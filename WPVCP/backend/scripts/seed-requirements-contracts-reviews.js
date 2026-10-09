const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

function generateValidPdfBuffer(title, subtitle, contentLines) {
  // Generate a valid PDF binary buffer (PDF-1.4 specification)
  const lines = [
    `%PDF-1.4`,
    `1 0 obj`,
    `<< /Type /Catalog /Pages 2 0 R >>`,
    `endobj`,
    `2 0 obj`,
    `<< /Type /Pages /Kids [3 0 R] /Count 1 >>`,
    `endobj`,
    `3 0 obj`,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>`,
    `endobj`,
    `5 0 obj`,
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`,
    `endobj`
  ];

  // Build stream content with text rendering
  let streamText = `BT\n/F1 20 Tf\n50 720 Td\n(${title.replace(/[()]/g, '')}) Tj\n`;
  streamText += `/F1 12 Tf\n0 -30 Td\n(${subtitle.replace(/[()]/g, '')}) Tj\n`;
  streamText += `/F1 10 Tf\n0 -25 Td\n(Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}) Tj\n`;
  streamText += `0 -25 Td\n(Status: VERIFIED & OFFICIALLY ACCEPTED) Tj\n`;
  streamText += `0 -35 Td\n(----------------------------------------------------------------------------------------------------) Tj\n`;

  contentLines.forEach(line => {
    streamText += `0 -20 Td\n(${line.replace(/[()]/g, '')}) Tj\n`;
  });

  streamText += `0 -40 Td\n(Digital Signature: Digitally Accepted & Stamped by Wedding Platform) Tj\n`;
  streamText += `0 -20 Td\n(Vows & Veils Platform Verification Certificate #VV-2026-DOC-VERIFIED) Tj\n`;
  streamText += `ET\n`;

  const streamLen = Buffer.byteLength(streamText, 'utf8');
  lines.push(`4 0 obj`);
  lines.push(`<< /Length ${streamLen} >>`);
  lines.push(`stream`);
  lines.push(streamText.trim());
  lines.push(`endstream`);
  lines.push(`endobj`);

  // Xref and trailer
  let pdfString = lines.join('\n') + '\n';
  const startXref = Buffer.byteLength(pdfString, 'utf8');

  pdfString += `xref\n0 6\n0000000000 65535 f \n`;
  pdfString += `0000000010 00000 n \n`;
  pdfString += `0000000060 00000 n \n`;
  pdfString += `0000000117 00000 n \n`;
  pdfString += `0000000300 00000 n \n`;
  pdfString += `0000000235 00000 n \n`;
  pdfString += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

  return Buffer.from(pdfString, 'utf8');
}

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Connected to MySQL database.');

    // 1. Ensure docs directory exists
    const docsDir = path.resolve(__dirname, '../uploads/docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    // Write PDF files
    const pdfs = [
      {
        filename: 'wedding_agreement.pdf',
        title: 'MASTER WEDDING SERVICES AGREEMENT',
        sub: 'Customer & Planner Officially Executed Contract',
        lines: [
          'Client: Rahul Sharma & Anita Patel (CUST-0001)',
          'Lead Planner: Elite Wedding Planners (PLANNER-0001)',
          'Project: Rahul & Anita Royal Wedding (WP-2026-1042)',
          'Contract Sum: INR 15,00,000 | Advance Retainer: 25% (Paid)',
          'Term: Nov 20, 2026 - Master Muhurtham & Grand Reception',
          'Scope: Complete Coordination, Venue Hall, Stage Design & Artisans'
        ]
      },
      {
        filename: 'customer_accepted_contract_wp1042.pdf',
        title: 'CUSTOMER ACCEPTED WEDDING CONTRACT',
        sub: 'Formal Customer Acceptance - Project WP-2026-1042',
        lines: [
          'Accepted by Customer: Rahul Sharma & Anita Patel',
          'Wedding Celebration Date: Nov 20, 2026',
          'Venue: The Grand Royal Palace & Convention, Bangalore',
          'Vendor Lineup: 5 Verified Vendors Confirmed and Approved',
          'Customer Consent: Approved for Milestone Billing and Escrow Release'
        ]
      },
      {
        filename: 'vendor_accepted_contract_v1.pdf',
        title: 'VENDOR ACCEPTED SERVICE CONTRACT - VENUE',
        sub: 'Contractual Agreement - The Grand Royal Palace & Convention',
        lines: [
          'Vendor Partner: The Grand Royal Palace (VND-0001)',
          'Wedding Project: Rahul & Anita Royal Wedding (WP-2026-1042)',
          'Event Date: Nov 20, 2026 (08:00 AM - 11:00 PM)',
          'Agreed Venue Fee: INR 4,50,000',
          'Status: Accepted & Dates Reserved on Master Calendar'
        ]
      },
      {
        filename: 'vendor_accepted_contract_v16.pdf',
        title: 'VENDOR ACCEPTED SERVICE CONTRACT - PHOTOGRAPHY',
        sub: 'Contractual Agreement - Shutter Moments Studio',
        lines: [
          'Vendor Partner: Shutter Moments Studio (VND-0016)',
          'Wedding Project: Rahul & Anita Royal Wedding (WP-2026-1042)',
          'Event Date: Nov 20, 2026 (Candid, Drone & Cinematic 4K)',
          'Agreed Photography Fee: INR 1,80,000',
          'Status: Accepted & Team Assigned'
        ]
      },
      {
        filename: 'vendor_accepted_contract_v4.pdf',
        title: 'VENDOR ACCEPTED SERVICE CONTRACT - CATERING',
        sub: 'Contractual Agreement - Royal Feast Gourmet Caterers',
        lines: [
          'Vendor Partner: Royal Feast Gourmet Caterers (VND-0004)',
          'Wedding Project: Rahul & Anita Royal Wedding (WP-2026-1042)',
          'Guest Count: 350 Guests (Multi-Cuisine Buffet & Live Counters)',
          'Agreed Catering Fee: INR 3,50,000',
          'Status: Accepted & Menu Finalized'
        ]
      },
      {
        filename: 'customer_signed_blueprint_agreement.pdf',
        title: 'STAGE BLUEPRINT & MANDAP DESIGN CONTRACT',
        sub: 'Customer & Decorator Approved Design Specifications',
        lines: [
          'Client: Rahul Sharma & Anita Patel',
          'Architectural Theme: Royal South Indian Silk & Jasmine Palace',
          'Stage Dimensions: 40ft x 20ft Traditional Floral Canopy',
          'Status: Customer Accepted & Architect Blueprint Stamped'
        ]
      }
    ];

    for (const p of pdfs) {
      const filePath = path.join(docsDir, p.filename);
      const buf = generateValidPdfBuffer(p.title, p.sub, p.lines);
      fs.writeFileSync(filePath, buf);
      console.log(`Generated PDF: ${filePath} (${buf.length} bytes)`);
    }

    // 2. Insert/Update Documents in database
    await conn.query('DELETE FROM documents WHERE id IN (1, 2, 3, 4, 5, 6)');
    const docRecords = [
      [1, 1, 2, 'Customer Accepted Wedding Contract - Rahul & Anita', 'CONTRACT', '/uploads/docs/customer_accepted_contract_wp1042.pdf', 524288, 'application/pdf', 'ACTIVE'],
      [2, 1, 2, 'Customer Accepted Master Wedding Agreement', 'CONTRACT', '/uploads/docs/wedding_agreement.pdf', 524288, 'application/pdf', 'ACTIVE'],
      [3, 1, 1, 'Vendor Accepted Service Agreement - The Grand Royal Palace', 'CONTRACT', '/uploads/docs/vendor_accepted_contract_v1.pdf', 524288, 'application/pdf', 'ACTIVE'],
      [4, 1, 16, 'Vendor Accepted Service Agreement - Shutter Moments Photography', 'CONTRACT', '/uploads/docs/vendor_accepted_contract_v16.pdf', 524288, 'application/pdf', 'ACTIVE'],
      [5, 1, 4, 'Vendor Accepted Service Agreement - Royal Feast Catering', 'CONTRACT', '/uploads/docs/vendor_accepted_contract_v4.pdf', 524288, 'application/pdf', 'ACTIVE'],
      [6, 1, 2, 'Customer Signed Mandap & Stage Blueprint Agreement', 'DESIGN_SKETCH', '/uploads/docs/customer_signed_blueprint_agreement.pdf', 524288, 'application/pdf', 'ACTIVE']
    ];

    for (const d of docRecords) {
      await conn.query(
        `INSERT INTO documents (id, wedding_project_id, uploader_id, title, document_type, file_path, file_size, file_type, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title=VALUES(title), document_type=VALUES(document_type), file_path=VALUES(file_path), status=VALUES(status)`,
        d
      );
    }
    console.log('Seeded 6 customer & vendor accepted contracts into documents table.');

    // 3. Seed at least 6 reviews in reviews table
    const [existingReviews] = await conn.query('SELECT COUNT(*) as count FROM reviews');
    if (existingReviews[0].count < 6) {
      await conn.query('DELETE FROM reviews WHERE id <= 10');
      // Columns: [id, wedding_project_id, booking_id, customer_id, vendor_id, planner_id, rating, review_text, response_text]
      const sampleReviews = [
        [1, 1, 1, 1, 1, 1, 5, 'The Grand Royal Palace was absolutely magnificent! The mandap setup and grand chandeliers blew all our guests away. Perfect venue for our wedding.', 'Thank you so much Rahul and Anita! It was a true pleasure hosting your royal celebration.'],
        [2, 1, 1, 1, 16, 1, 5, 'Shutter Moments Photography team was extraordinary! They captured every traditional emotion and the teaser video made everyone emotional.', 'Thank you for having us capture your once-in-a-lifetime moments! Wishing you both everlasting happiness.'],
        [3, 1, 1, 1, 4, 1, 5, 'The traditional feast and live counters by Royal Feast Gourmet were the talk of the evening. Every dish was authentic and piping hot.', 'Thank you! Serving authentic South Indian delicacies for your auspicious muhurtham was our honor.'],
        [4, 1, 1, 1, null, 1, 5, 'Elite Wedding Planners handled everything seamlessly. We did not feel a moment of stress throughout our 3-day wedding celebration. Highly recommended!', 'We loved planning your dream celebration! Thank you for trusting us with your special day.'],
        [5, 2, 2, 2, 1, 1, 5, 'Top-tier hospitality, impeccably clean guest rooms, and punctual banquet service. Best wedding venue in Bangalore!', 'We appreciate the glowing review! Best wishes to Rohit and Sneha.'],
        [6, 2, 2, 2, 16, 1, 5, 'Brilliant drone aerial cinematography and candid portraits. Delivered all albums well ahead of schedule.', 'Thank you Rohit & Sneha! You both were wonderful to work with.'],
        [7, 1, 1, 1, 4, 1, 4, 'Excellent welcome drinks and dessert spread. The guest hospitality staff was very attentive.', 'Thank you for the warm feedback!']
      ];

      for (const r of sampleReviews) {
        await conn.query(
          `INSERT INTO reviews (id, wedding_project_id, booking_id, customer_id, vendor_id, planner_id, rating, review_text, response_text)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE rating=VALUES(rating), review_text=VALUES(review_text), response_text=VALUES(response_text)`,
          r
        );
      }
      console.log('Seeded 7 reviews into reviews table.');
    }

    // 4. Seed at least 5 schedules for active vendors in wedding_schedule
    // Let's ensure vendor 1, 4, 16 each have at least 5 schedule items
    const schedules = [
      [101, 1, 'Bride & Groom Morning Pooja & Haldi Ceremony', '2026-11-20', '06:00:00', '08:00:00', 'Palace Lawns', 'Traditional turmeric and pooja ceremonies with close family.', 'Bride Family', 16, 'SCHEDULED'],
      [102, 1, 'Baraat & Groom Royal Procession Arrival', '2026-11-20', '08:30:00', '10:00:00', 'Grand Archway & North Lawn', 'Vintage car arrival with live percussion band and floral shower.', 'Lead Planner', 1, 'SCHEDULED'],
      [103, 1, 'Auspicious Muhurtham & Kanyadaan Ceremony', '2026-11-20', '10:15:00', '12:30:00', 'Central Royal Mandap', 'Vedic mantras, mangalsutra tying, and saptapadi pheras.', 'Head Priest', 1, 'SCHEDULED'],
      [104, 1, 'Traditional Royal Banquet Feast', '2026-11-20', '12:30:00', '15:00:00', 'Air-Conditioned Dining Hall', 'Elaborate traditional lunch service on plantain leaves with 28 delicacies.', 'Catering Manager', 4, 'SCHEDULED'],
      [105, 1, 'Couple Sunset Portrait & Golden Hour Photoshoot', '2026-11-20', '16:30:00', '18:00:00', 'Heritage Courtyard & Lotus Pond', 'Cinematic drone shots and candid editorial photography.', 'Lead Photographer', 16, 'SCHEDULED'],
      [106, 1, 'Grand Reception & Live Classical Fusion Music', '2026-11-20', '18:30:00', '22:30:00', 'Grand Ballroom & Courtyard', 'Stage greetings, live music ensemble, multi-cuisine dinner buffet.', 'Master of Ceremonies', 1, 'SCHEDULED'],
      [107, 1, 'Evening Buffet & Live Counter Refreshments', '2026-11-20', '19:00:00', '22:30:00', 'Banquet Lawns', 'Live chaat counters, tandoor stations, mocktail bar, and artisan desserts.', 'Catering Head Chef', 4, 'SCHEDULED'],
      [108, 1, 'Reception Stage Photo Sessions & Cake Cutting', '2026-11-20', '19:30:00', '21:30:00', 'Main Stage', 'Family photo sessions, cake cutting ceremony, and couple dance.', 'Lead Photographer', 16, 'SCHEDULED'],
      [109, 1, 'Venue Post-Event Handover & Clean-up Inspection', '2026-11-20', '23:00:00', '23:59:00', 'All Venue Facilities', 'Final inspection and security sign-off with planner.', 'Venue Manager', 1, 'SCHEDULED'],
      [110, 1, 'Midnight Snack Station & Farewell Sweets Distribution', '2026-11-20', '22:00:00', '23:30:00', 'Portico Lounge', 'Hot masala chai, midnight snacks, and traditional sweet boxes.', 'Banquet Captain', 4, 'SCHEDULED']
    ];

    for (const s of schedules) {
      await conn.query(
        `INSERT INTO wedding_schedule (id, wedding_project_id, event_title, event_date, start_time, end_time, location, description, person_in_charge, vendor_id, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE event_title=VALUES(event_title), event_date=VALUES(event_date), start_time=VALUES(start_time), end_time=VALUES(end_time), location=VALUES(location), description=VALUES(description), vendor_id=VALUES(vendor_id), status=VALUES(status)`,
        s
      );
    }
    console.log('Seeded 10 master wedding schedule events across vendors 1, 4, and 16.');

    // 5. Update vendor total_reviews and ratings
    await conn.query('UPDATE vendors SET rating = 4.95, total_reviews = 18 WHERE id = 1');
    await conn.query('UPDATE vendors SET rating = 4.90, total_reviews = 22 WHERE id = 4');
    await conn.query('UPDATE vendors SET rating = 5.00, total_reviews = 15 WHERE id = 16');

    await conn.end();
    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
})();
