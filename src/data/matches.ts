export interface Team {
  code: string;
  name: string;
  flag: string;
}

export interface Match {
  id: string;
  tournament: string;
  sport: string;
  team1: Team;
  team2: Team;
  image: string;
  buttonColor: 'red' | 'purple' | 'green' | 'blue';
  sportIcon: string;
}

export const matches: Match[] = [
  {
    id: "130800",
    tournament: "Shpageeza Cricket League, 2025",
    sport: "cricket",
    team1: {
      code: "BD",
      name: "Band E Amir Dragons",
      flag: "https://d13ir53smqqeyp.cloudfront.net/flags/cr-flags/FC-BD@2x.png"
    },
    team2: {
      code: "SG",
      name: "Speen Ghar Tigers",
      flag: "https://d13ir53smqqeyp.cloudfront.net/flags/cr-flags/FC-ST@2x.png"
    },
    image: "https://www.fancode.com/skillup-uploads/cms-media/130800_5425_BD_SG_fc-App.jpg",
    buttonColor: "red",
    sportIcon: "🏏"
  },
  {
    id: "130771",
    tournament: "Pearl of Africa T20, 2025",
    sport: "cricket",
    team1: {
      code: "NIG",
      name: "Nigeria",
      flag: "https://d13ir53smqqeyp.cloudfront.net/flags/cr-flags/FC-NIGE@2x.png"
    },
    team2: {
      code: "NAM-A",
      name: "Namibia A",
      flag: "https://d13ir53smqqeyp.cloudfront.net/flags/cr-flags/FC-NAMA@2x.png"
    },
    image: "https://www.fancode.com/skillup-uploads/cms-media/Pearl-of-Africa-T20-old.jpg",
    buttonColor: "red",
    sportIcon: "🏏"
  },
  {
    id: "131913",
    tournament: "ECS Sweden, Stockholm, 2025",
    sport: "cricket",
    team1: {
      code: "MAR",
      name: "Marsta",
      flag: "https://d13ir53smqqeyp.cloudfront.net/flags/cr-flags/FC-MAR@2x.png"
    },
    team2: {
      code: "ALZ",
      name: "Alby Zalmi",
      flag: "https://d13ir53smqqeyp.cloudfront.net/flags/cr-flags/FC-ALZ@2x.png"
    },
    image: "https://www.fancode.com/skillup-uploads/cms-media/ECS-Sweden,-Stockholm,-2025_match-card.jpg",
    buttonColor: "red",
    sportIcon: "🏏"
  },
  {
    id: "131273",
    tournament: "Rwanda Tri Nations T20 Cup 2025",
    sport: "cricket",
    team1: {
      code: "BAH",
      name: "Bahrain",
      flag: "https://d13ir53smqqeyp.cloudfront.net/flags/cr-flags/FC-BAH@2x.png"
    },
    team2: {
      code: "MAL",
      name: "Malawi",
      flag: "https://d13ir53smqqeyp.cloudfront.net/flags/cr-flags/FC-MALA@2x.png"
    },
    image: "https://www.fancode.com/skillup-uploads/cms-media/Rwanda-Tri-nations-T20-cup-old.png",
    buttonColor: "red",
    sportIcon: "🏏"
  },
  {
    id: "132128",
    tournament: "ISPS Handa Women's Scottish Open",
    sport: "golf",
    team1: {
      code: "IHWS",
      name: "Tournament",
      flag: "https://d13ir53smqqeyp.cloudfront.net/flags/gl-flags/FC-LPGA@2x.png"
    },
    team2: {
      code: "LOC",
      name: "Location",
      flag: "https://d13ir53smqqeyp.cloudfront.net/flags/gl-flags/FC-LOC@2x.png"
    },
    image: "https://www.fancode.com/skillup-uploads/cms-media/ISPS-Handa-Womens-Scottish-Open_match-card.jpg",
    buttonColor: "red",
    sportIcon: "⛳"
  },
  {
    id: "132129",
    tournament: "F3 Belgium 2025",
    sport: "formula3",
    team1: {
      code: "F3",
      name: "Formula 3",
      flag: "https://d13ir53smqqeyp.cloudfront.net/flags/gl-flags/FC-F3@2x.png"
    },
    team2: {
      code: "LOC",
      name: "Belgium",
      flag: "https://d13ir53smqqeyp.cloudfront.net/flags/gl-flags/FC-LOC@2x.png"
    },
    image: "https://www.fancode.com/skillup-uploads/cms-media/F3-Belgium-2025_match-card.jpg",
    buttonColor: "red",
    sportIcon: "🏎️"
  }
];