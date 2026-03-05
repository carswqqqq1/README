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
    phoneTracking: {
      default: {
        raw: '4809229497',
        display: '(480) 922-9497'
      },
      sources: {
        google: {
          raw: '4809229497',
          display: '(480) 922-9497'
        },
        gbp: {
          raw: '4809229497',
          display: '(480) 922-9497'
        },
        ads: {
          raw: '4809229497',
          display: '(480) 922-9497'
        }
      }
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
        text: 'Fire pit and paver patio came out exactly like the render. Crew cleaned up every day and stayed on schedule.'
      },
      {
        author: 'David R.',
        location: 'Paradise Valley, AZ',
        rating: 5,
        text: 'Communication was excellent from quote to final walkthrough. We always knew what phase was next.'
      },
      {
        author: 'Amanda L.',
        location: 'Arcadia, Phoenix',
        rating: 5,
        text: 'Our Arcadia yard needed a modern xeriscape plan. The 3D concept matched the finished build almost exactly.'
      },
      {
        author: 'Chris T.',
        location: 'Tempe, AZ',
        rating: 5,
        text: 'Outdoor kitchen build finished faster than expected. The team was respectful and the jobsite stayed clean.'
      },
      {
        author: 'Nicole P.',
        location: 'Mesa, AZ',
        rating: 5,
        text: 'The crew was professional and detail-oriented. Our front yard now looks high-end without high maintenance.'
      },
      {
        author: 'Matt R.',
        location: 'Scottsdale, AZ',
        rating: 5,
        text: 'No surprises on scope or pricing. Great coordination and the final punch list was handled quickly.'
      }
    ],
    googleReviews: {
      rating: '4.9',
      count: '72',
      platform: 'Google Reviews',
      profileUrl: 'https://www.google.com/search?q=Think+Green+Landscape+Scottsdale+AZ+reviews',
      snapshotDate: 'Updated March 2026'
    },
    trustAssets: {
      licenseVerifyUrl: 'https://roc.az.gov/',
      bondVerifyUrl: 'https://roc.az.gov/',
      insuranceStatement: 'Insurance and bonding documentation available during consultation.'
    },
    financing: {
      enabled: true,
      copy: 'Financing options may be available for qualified projects.'
    },
    analytics: {
      ga4MeasurementId: ''
    }
  };
})();
