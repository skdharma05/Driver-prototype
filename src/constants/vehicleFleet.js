export const VEHICLE_FLEET = {
  open: {
    label: 'Open Body',
    icon: '🚛',
    tons: '7.5 - 43 Ton',
    variants: {
      '6 Wheeler': {
        '7.5t': ['17ft','19ft','20ft','22ft','24ft'],
        '8t':   ['19ft','20ft','22ft','24ft'],
        '9t':   ['20ft','22ft','24ft'],
        '10t':  ['20ft','22ft','24ft'],
        '12t':  ['20ft','22ft','24ft'],
        '13t':  ['22ft','24ft'],
      },
      '10 Wheeler': {
        '12t': ['22ft'], '13t': ['22ft','24ft'],
        '15t': ['Standard'], '16t': ['Standard'],
        '18t': ['Standard'], '18.5t': ['Standard'], '19t': ['Standard'],
      },
      '12 Wheeler': {
        '20t': ['Standard'], '21t': ['Standard'], '22t': ['Standard'],
        '24t': ['Standard'], '25t': ['Standard'],
      },
      '14 Wheeler': {
        '25t': ['Standard'], '26t': ['Standard'],
        '29t': ['Standard'], '30t': ['Standard'],
      },
      '16 Wheeler': { '33t': ['Standard'], '35t': ['Standard'] },
      '18 Wheeler': { '36t': ['Standard'], '43t': ['Standard'] },
    },
  },
  container: {
    label: 'Container',
    icon: '📦',
    tons: '7.5 - 30 Ton',
    variants: {
      'Standard (19-24ft)': {
        '19ft': ['7.5t','9t'], '20ft': ['7.5t','9t'],
        '22ft': ['7.5t','9t'], '24ft': ['7.5t','9t'],
      },
      '32ft Single Axle':  { '32ft SXL': ['7.5t','9t'] },
      '32ft Multi Axle':   { '32ft MXL': ['14.5t','15t','18t'] },
      '32ft Triple Axle':  { '32ft TXL': ['19t','20t','24t','25t','30t'] },
    },
  },
  lcv: {
    label: 'LCV',
    icon: '🚐',
    tons: '2.5 - 7 Ton',
    variants: {
      'LCV Open — 4 Wheeler': {
        '2.5t': ['14ft','17ft','19ft','20ft','22ft','24ft'],
        '3t':   ['14ft','17ft','19ft','20ft','22ft','24ft'],
        '3.5t': ['14ft','17ft','19ft','20ft','22ft','24ft'],
        '4t':   ['14ft','17ft','19ft','20ft','22ft','24ft'],
        '4.5t': ['17ft','19ft','20ft','22ft','24ft'],
        '5t':   ['17ft','19ft','20ft','22ft','24ft'],
        '5.5t': ['17ft','19ft','20ft','22ft','24ft'],
        '6t':   ['17ft','19ft','20ft','22ft','24ft'],
        '7t':   ['19ft','20ft','22ft','24ft'],
      },
      'LCV Open — 6 Wheeler': {
        '6t': ['19ft','20ft','22ft','24ft'],
        '7t': ['19ft','20ft','22ft','24ft'],
      },
      'LCV Container': {
        '14ft': ['3t'],
        '17ft': ['6t'],
        '19ft': ['6t','7t'], '20ft': ['6t','7t'],
        '22ft': ['6t','7t'], '24ft': ['6t','7t'],
        '32ft SXL': ['6t','7t'],
      },
    },
  },
  mini: {
    label: 'Mini / Pickup',
    icon: '🛻',
    tons: '0.75 - 2 Ton',
    variants: {
      'Mini Open': {
        'Tata Ace': ['0.75t','1t'],
      },
      'Mini Container': {
        'Tata Ace': ['0.75t','1t'],
      },
      'Pickup Open': {
        'Dost': ['1.5t','2t'],
      },
      'Pickup Container': {
        'Dost': ['1.5t','2t'],
      },
    },
  },
  trailer: {
    label: 'Trailer',
    icon: '🚜',
    tons: '22 - 43 Ton',
    variants: {
      'Dala Body': {
        '22-25t': ['22t'],
        '25-30t': ['25t','26t','27t','28t','29t'],
        '30-35t': ['30t','31t','32t','33t','34t'],
        '35-40t': ['35t','36t','37t','38t','39t'],
        '40-45t': ['40t','41t','42t','43t'],
      },
      'Flat Bed': {
        '10-12t': ['10t 20ft','12t 22ft'],
        '15-20t': ['16t 19ft','16t 20ft','17t 19ft','17t 20ft','18t 19ft','18t 20ft','19t 19ft','19t 20ft'],
        '20-25t': ['20t 40ft','21t 19ft','21t 20ft','22t 20ft','23t 20ft','24t 20ft','24t 40ft'],
        '25-30t': ['25t 20ft','25t 34ft','25t 40ft','26t 40ft','27t 21ft','27t 40ft','28t 35ft','28t 40ft','29t 20ft','29t 40ft'],
        '30-35t': ['30t 30ft','30t 35ft','30t 38ft','30t 40ft','31t 40ft','31t 42ft','32t 40ft','33t 35ft','33t 38ft','33t 39ft','33t 40ft','33t 41ft','34t 20ft','34t 35ft','34t 38ft','34t 40ft','34t 42ft'],
        '35-40t': ['35t 35ft','35t 36ft','35t 38ft','35t 39ft','35t 40ft','35t 41ft','35t 44ft'],
        '40-45t': ['40t 38ft','40t 40ft','40t 41ft','40t 42ft','40t 43ft','41t 40ft','42t 38ft','42t 40ft','42t 42ft','43t 32ft','43t 38ft','43t 40ft','43t 42ft','43t 43ft'],
      },
    },
  },
  industrial: {
    label: 'Industrial',
    icon: '🏭',
    tons: '8 - 36 Ton',
    variants: {
      'Tanker': {
        '7.5-10t': ['8t 6tyres'],
        '10-15t':  ['10t 6tyres'],
        '15-20t':  ['16t 10tyres','18t 10tyres','19t 10tyres'],
        '20-25t':  ['21t 12tyres','24t 12tyres'],
        '25-30t':  ['25t 12tyres','26t 14tyres','29t 14tyres'],
        '30-35t':  ['30t 14tyres'],
        '35-40t':  ['35t 16tyres','36t 16tyres'],
      },
      'Tipper': {
        '5-10t':   ['9t 6tyres'],
        '15-20t':  ['15t 10tyres','16t 10tyres','18t 10tyres','19t 10tyres'],
        '25-30t':  ['25t 12tyres','29t 14tyres'],
        '30-35t':  ['30t 14tyres'],
      },
      'Bulker': {
        '20-25t':  ['21t 12tyres','24t 12tyres'],
        '25-30t':  ['25t 12tyres','29t 14tyres'],
        '30-35t':  ['30t 14tyres'],
      },
    },
  },
};
