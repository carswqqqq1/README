/* Global site configuration for fast client cloning.
   Duplicate this file per client and update values in one place. */
(function () {
  window.SITE_CONFIG = {
    businessName: 'Think Green Design | Build Landscape',
    shortName: 'Think Green',
    email: 'thinkgreen@thinkgreenaz.com',
    phone: {
      raw: '4809229497',
      display: '(480) 922-9497'
    },
    address: {
      line1: '7730 E. Gelding Dr. Ste 1',
      city: 'Scottsdale',
      state: 'AZ',
      zip: '85260'
    },
    brand: {
      logoPath: 'img/logo.png',
      primary: '#1b4332',
      primaryMid: '#2d6a4f',
      paper: '#faf7f3'
    },
    contactFormServices: [
      'Landscape Design & Build',
      'Hardscaping',
      'Water Feature',
      'Fire Feature / Outdoor Kitchen',
      'Outdoor Lighting',
      'Desert / Drought-Tolerant Design',
      'Pergola / Shade Structure',
      'Irrigation',
      'Putting Green',
      'Not sure yet'
    ],
    projectFit: [
      {
        label: 'Most Requested',
        title: 'Full Landscape Design & Build',
        description: 'Best for complete yard transformations, phased construction, and master planning.',
        ctaService: 'Landscape Design & Build'
      },
      {
        label: 'Lifestyle Upgrade',
        title: 'Hardscape, Fire, and Outdoor Living',
        description: 'Great for patios, kitchens, fireplaces, pathways, and entertainment-centered layouts.',
        ctaService: 'Fire Feature / Outdoor Kitchen'
      },
      {
        label: 'Desert Smart',
        title: 'Drought-Tolerant Modernization',
        description: 'Ideal for water-wise upgrades, low-maintenance planting, and Arizona climate resilience.',
        ctaService: 'Desert / Drought-Tolerant Design'
      }
    ],
    beforeAfter: {
      beforeImage: 'img/projects/before-29.jpg',
      beforeAlt: 'Original yard before renovation',
      afterImage: 'img/projects/after-29.jpg',
      afterAlt: 'Completed landscape after renovation',
      note: 'Drag the slider to compare a real project before and after completion.'
    },
    reviews: [
      {
        author: 'Sarah M.',
        location: 'North Scottsdale, AZ',
        rating: 5,
        text: 'Think Green transformed our backyard in North Scottsdale. Clear communication, clean crew, and a finished result that looks even better than the renderings.'
      },
      {
        author: 'David R.',
        location: 'Paradise Valley, AZ',
        rating: 5,
        text: 'Professional crew, on time every day, and the fire feature patio in Paradise Valley turned out incredible. Highly recommend them.'
      },
      {
        author: 'Amanda L.',
        location: 'Arcadia, Phoenix',
        rating: 5,
        text: 'We wanted a modern desert landscape for Arcadia that still felt low-maintenance. The team nailed the design and execution.'
      }
    ],
    analytics: {
      ga4MeasurementId: ''
    }
  };
})();
