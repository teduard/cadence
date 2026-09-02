import type { Row, Title } from "./types";

// Fictional catalog — original titles, no real film/show IP used.
const T = (t: Partial<Title> & Pick<Title, "id" | "name" | "backdrop" | "poster">): Title => ({
  year: 2024,
  rating: 7.8,
  duration: "1h 52m",
  genres: ["Drama"],
  synopsis: "No synopsis available.",
  kind: "movie",
  maturity: "PG-13",
  ...t,
});

export const titles: Title[] = [
  T({ id: "t1", name: "Amber Static", backdrop: "static", poster: "static", year: 2025, rating: 8.4, duration: "2h 08m", genres: ["Sci-Fi", "Thriller"], kind: "movie", maturity: "R", synopsis: "A signal engineer discovers a frequency that lets her replay the last six minutes of anyone's life — including her own death." }),
  T({ id: "t2", name: "The Long Corridor", backdrop: "corridor", poster: "corridor", year: 2023, rating: 7.9, duration: "3 Seasons", genres: ["Mystery", "Drama"], kind: "series", maturity: "TV-MA", synopsis: "Behind every door in a decommissioned hospital wing is a year of someone's life they never finished living." }),
  T({ id: "t3", name: "Marrow & Salt", backdrop: "marrow", poster: "marrow", year: 2024, rating: 8.1, duration: "1h 57m", genres: ["Drama"], kind: "movie", maturity: "R", synopsis: "Two estranged sisters inherit their father's failing fishing fleet and thirty years of things neither of them said." }),
  T({ id: "t4", name: "Nine Coins", backdrop: "coins", poster: "coins", year: 2022, rating: 7.2, duration: "1h 41m", genres: ["Heist", "Comedy"], kind: "movie", maturity: "PG-13", synopsis: "A crew of failed street magicians attempt one impossible trick: making a corrupt casino's vault disappear." }),
  T({ id: "t5", name: "Glass Orchard", backdrop: "orchard", poster: "orchard", year: 2025, rating: 8.6, duration: "2 Seasons", genres: ["Fantasy", "Drama"], kind: "series", maturity: "TV-14", synopsis: "A village grows fruit that shows the eater a memory that never happened — and someone has started a very lucrative harvest." }),
  T({ id: "t6", name: "Low Orbit", backdrop: "orbit", poster: "orbit", year: 2021, rating: 7.5, duration: "2h 15m", genres: ["Sci-Fi", "Action"], kind: "movie", maturity: "PG-13", synopsis: "A salvage crew on a dying space station has fourteen hours of air and one shuttle seat between the six of them." }),
  T({ id: "t7", name: "Paper Coyote", backdrop: "coyote", poster: "coyote", year: 2024, rating: 7.7, duration: "1h 49m", genres: ["Animation", "Adventure"], kind: "movie", maturity: "PG", synopsis: "A folded-paper fox built by a lonely origami master learns to unfold himself to save the workshop from the recycling truck." }),
  T({ id: "t8", name: "Fault Lines", backdrop: "fault", poster: "fault", year: 2023, rating: 8.0, duration: "4 Seasons", genres: ["Crime", "Drama"], kind: "series", maturity: "TV-MA", synopsis: "A seismologist turned insurance fraud investigator finds that the ground and the truth move in the same slow, dangerous ways." }),
  T({ id: "t9", name: "Ember Season", backdrop: "ember", poster: "ember", year: 2020, rating: 6.9, duration: "1h 38m", genres: ["Romance"], kind: "movie", maturity: "PG-13", synopsis: "Two wildfire lookout rangers spend one dry, dangerous summer falling for each other across nine miles of ridge line." }),
  T({ id: "t10", name: "Static Choir", backdrop: "choir", poster: "choir", year: 2025, rating: 8.3, duration: "2h 02m", genres: ["Horror"], kind: "movie", maturity: "R", synopsis: "A small-town church choir keeps rehearsing a hymn none of them remember writing, and it keeps getting louder." }),
  T({ id: "t11", name: "The Understudy", backdrop: "understudy", poster: "understudy", year: 2022, rating: 7.4, duration: "1 Season", genres: ["Drama", "Thriller"], kind: "series", maturity: "TV-MA", synopsis: "When the lead actress vanishes three days before opening night, her understudy starts living a role that isn't quite fiction." }),
  T({ id: "t12", name: "Copper Meridian", backdrop: "meridian", poster: "meridian", year: 2024, rating: 7.6, duration: "2h 21m", genres: ["Western"], kind: "movie", maturity: "R", synopsis: "A retired railway surveyor is hired to map a border that both governments insist does not exist." }),
  T({ id: "t13", name: "Halflight", backdrop: "halflight", poster: "halflight", year: 2023, rating: 8.2, duration: "1h 46m", genres: ["Sci-Fi", "Drama"], kind: "movie", maturity: "PG-13", synopsis: "In a city with six hours of sunlight a year, a lighting engineer falls for the one person who prefers the dark." }),
  T({ id: "t14", name: "Blue Hour Diner", backdrop: "diner", poster: "diner", year: 2021, rating: 7.1, duration: "2 Seasons", genres: ["Comedy", "Drama"], kind: "series", maturity: "TV-14", synopsis: "The night shift at a highway diner collects the stories nobody tells in daylight." }),
  T({ id: "t15", name: "Fever Line", backdrop: "fever", poster: "fever", year: 2025, rating: 7.8, duration: "1h 55m", genres: ["Thriller"], kind: "movie", maturity: "R", synopsis: "An epidemiologist tracing an outbreak realizes the map of infections is also a map of a twenty-year-old cover-up." }),
  T({ id: "t16", name: "Split Sail", backdrop: "sail", poster: "sail", year: 2020, rating: 6.8, duration: "1h 33m", genres: ["Adventure"], kind: "movie", maturity: "PG", synopsis: "Twin siblings race two halves of their late grandfather's broken boat across the same regatta, refusing to speak to each other at the finish." }),
];

export const rows: Row[] = [
  { id: "trending", title: "Trending Now", items: titles.filter(t => ["t1","t5","t8","t10","t3","t6"].includes(t.id)) },
  { id: "originals", title: "Originals", items: titles.filter(t => t.kind === "series") },
  { id: "new", title: "New Releases", items: [...titles].sort((a,b) => b.year - a.year).slice(0, 8) },
  { id: "acclaimed", title: "Critically Acclaimed", items: [...titles].sort((a,b) => b.rating - a.rating).slice(0, 8) },
  { id: "movies", title: "Movies", items: titles.filter(t => t.kind === "movie") },
];

export const heroTitle: Title = titles[0];
