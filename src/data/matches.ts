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
    id: "live001",
    tournament: "India vs England Test Series 2025",
    sport: "cricket",
    team1: {
      code: "IND",
      name: "India",
      flag: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/304600/304665.png"
    },
    team2: {
      code: "ENG",
      name: "England",
      flag: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/304600/304661.png"
    },
    image: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_w_1200,q_50/lsci/db/PICTURES/CMS/381300/381345.jpg",
    buttonColor: "red",
    sportIcon: "🏏"
  },
  {
    id: "live002",
    tournament: "Pearl of Africa T20 2025",
    sport: "cricket",
    team1: {
      code: "UGA",
      name: "Uganda",
      flag: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/304600/304697.png"
    },
    team2: {
      code: "KEN",
      name: "Kenya",
      flag: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/304600/304669.png"
    },
    image: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_w_1200,q_50/lsci/db/PICTURES/CMS/381200/381234.jpg",
    buttonColor: "red",
    sportIcon: "🏏"
  },
  {
    id: "live003",
    tournament: "Pearl of Africa T20 2025",
    sport: "cricket",
    team1: {
      code: "NAM-A",
      name: "Namibia A",
      flag: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/304600/304677.png"
    },
    team2: {
      code: "NIG",
      name: "Nigeria",
      flag: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/304600/304678.png"
    },
    image: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_w_1200,q_50/lsci/db/PICTURES/CMS/381200/381235.jpg",
    buttonColor: "purple",
    sportIcon: "🏏"
  },
  {
    id: "live004",
    tournament: "New Zealand vs Zimbabwe T20I 2025",
    sport: "cricket",
    team1: {
      code: "NZ",
      name: "New Zealand",
      flag: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/304600/304676.png"
    },
    team2: {
      code: "ZIM",
      name: "Zimbabwe",
      flag: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/304600/304706.png"
    },
    image: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_w_1200,q_50/lsci/db/PICTURES/CMS/381100/381156.jpg",
    buttonColor: "green",
    sportIcon: "🏏"
  },
  {
    id: "live005",
    tournament: "Pakistan vs Bangladesh T20I 2025",
    sport: "cricket",
    team1: {
      code: "PAK",
      name: "Pakistan",
      flag: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/304600/304680.png"
    },
    team2: {
      code: "BAN",
      name: "Bangladesh",
      flag: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/304600/304652.png"
    },
    image: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_w_1200,q_50/lsci/db/PICTURES/CMS/381000/381067.jpg",
    buttonColor: "blue",
    sportIcon: "🏏"
  },
  {
    id: "live006",
    tournament: "County Championship 2025",
    sport: "cricket",
    team1: {
      code: "DUR",
      name: "Durham",
      flag: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/304600/304659.png"
    },
    team2: {
      code: "SOM",
      name: "Somerset",
      flag: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/304600/304690.png"
    },
    image: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_w_1200,q_50/lsci/db/PICTURES/CMS/380900/380945.jpg",
    buttonColor: "red",
    sportIcon: "🏏"
  }
];