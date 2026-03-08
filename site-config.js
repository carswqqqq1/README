(function (root, factory) {
  var config = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = config;
  }

  if (root) {
    root.SITE_CONFIG = config;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  var siteBaseUrl = 'https://thinkgreen-az.netlify.app';
  var manifestPath = '/manifest.json';
  var reviewSourceUrl = 'https://reviews.birdeye.com/think-green-design-build-landscape-156221164342730';

  return {
    siteBaseUrl: siteBaseUrl,
    manifestPath: manifestPath,
    businessName: 'Think Green Design | Build Landscape',
    shortName: 'Think Green',
    email: 'thinkgreen@thinkgreenaz.com',
    ownerEmail: 'thinkgreen@thinkgreenaz.com',
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
    serviceAreas: [
      'Scottsdale',
      'Paradise Valley',
      'Phoenix',
      'Fountain Hills',
      'Cave Creek',
      'Gilbert',
      'Tempe',
      'Mesa',
      'Chandler'
    ],
    brand: {
      logoPath: 'img/logo.png',
      primary: '#1b4332',
      primaryMid: '#2d6a4f',
      paper: '#faf7f3'
    },
    reviewRating: '4.7',
    reviewCount: '47',
    reviewSource: 'Birdeye',
    reviewSourceUrl: reviewSourceUrl,
    reviewSnapshotDate: 'Reviewed March 8, 2026',
    contactFormServices: [
      'Landscape Design & Build',
      'Hardscaping',
      'Artificial Turf',
      'Desert / Drought-Tolerant Design',
      'Water Feature',
      'Fire Feature / Outdoor Kitchen',
      'Outdoor Lighting',
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
        projectType: 'Paver patio and fire pit',
        reviewDate: 'January 2026',
        text: 'Fire pit and paver patio came out exactly like the render. Crew cleaned up every day and stayed on schedule.'
      },
      {
        author: 'David R.',
        location: 'Paradise Valley, AZ',
        rating: 5,
        projectType: 'Full outdoor living remodel',
        reviewDate: 'December 2025',
        text: 'Communication was excellent from quote to final walkthrough. We always knew what phase was next.'
      },
      {
        author: 'Amanda L.',
        location: 'Arcadia, Phoenix',
        rating: 5,
        projectType: 'Modern xeriscape design-build',
        reviewDate: 'November 2025',
        text: 'Our Arcadia yard needed a modern xeriscape plan. The 3D concept matched the finished build almost exactly.'
      },
      {
        author: 'Chris T.',
        location: 'Tempe, AZ',
        rating: 5,
        projectType: 'Outdoor kitchen installation',
        reviewDate: 'October 2025',
        text: 'Outdoor kitchen build finished faster than expected. The team was respectful and the jobsite stayed clean.'
      },
      {
        author: 'Nicole P.',
        location: 'Mesa, AZ',
        rating: 5,
        projectType: 'Front-yard refresh',
        reviewDate: 'September 2025',
        text: 'The crew was professional and detail-oriented. Our front yard now looks high-end without high maintenance.'
      },
      {
        author: 'Matt R.',
        location: 'Scottsdale, AZ',
        rating: 5,
        projectType: 'Backyard remodel',
        reviewDate: 'August 2025',
        text: 'No surprises on scope or pricing. Great coordination and the final punch list was handled quickly.'
      }
    ],
    googleReviews: {
      rating: '4.7',
      count: '47',
      platform: 'Birdeye',
      profileUrl: reviewSourceUrl,
      snapshotDate: 'Reviewed March 8, 2026'
    },
    trustAssets: {
      licenseVerifyUrl: 'https://roc.az.gov/search/',
      bondVerifyUrl: '',
      licenseNumbers: ['157201 CR-21', '304902 B-4'],
      licensePrompt: 'Verify current Arizona ROC licensing using the official contractor search and the license numbers shown below.',
      bondPrompt: 'Bond and insurance documentation is provided during consultation so you can review current coverage before project start.',
      insuranceStatement: 'Current insurance and bonding documentation is available during consultation for full transparency.'
    },
    financing: {
      enabled: true,
      copy: 'Financing options may be available for qualified projects.'
    },
    analytics: {
      ga4MeasurementId: 'G-B85D2Y2858'
    }
  };
});
