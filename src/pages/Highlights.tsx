import { Header } from "@/components/Header";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const Highlights = () => {
  // YouTube highlights - add your video IDs and optional titles here
  const highlights: { id: string; title?: string }[] = [
    { id: "Aqb4XQ-_BfM", title: "Match 4 | Pakistan vs Oman | Match Highlights | DP World Asia Cup 2025" },
    { id: "bN-g1VlEtBA", title: "Match 3 | Bangladesh vs Hong Kong, China | Match Highlights | DP World Asia Cup 2025" },
    { id: "xGtEE0qLuXA", title: "Match 2 | India vs United Arab Emirates | Match Highlights | DP World Asia Cup 2025" },
    { id: "5v1NmqyWPGc", title: "Match 1 | Afghanistan vs Hong Kong | Match Highlights | DP World Asia Cup 2025" },
    // { id: "AnotherID", title: "Another Highlight" },
  ];

  return (
    <div className="min-h-screen bg-background smooth-scroll">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-accent to-fc-cyan bg-clip-text text-transparent">
            Match Highlights
          </h1>
          <p className="text-muted-foreground">
            Watch the best moments from recent cricket matches
          </p>
        </div>

        {/* Highlights Section */}
        <section
          aria-labelledby="highlights-heading"
          className="animate-fade-in"
        >
          {highlights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {highlights.map((v) => (
                <article
                  key={v.id}
                  className="bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  <AspectRatio ratio={16 / 9}>
                    <iframe
                      className="w-full h-full rounded-md"
                      src={`https://www.youtube.com/embed/${v.id}`}
                      title={v.title || "Match Highlight"}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </AspectRatio>
                  {v.title ? (
                    <div className="p-4">
                      <h3 className="text-sm font-medium leading-relaxed">{v.title}</h3>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-border rounded-lg text-muted-foreground">
              <p className="text-lg">No highlights available yet.</p>
              <p className="text-sm mt-2">
                Check back soon for match highlights!
              </p>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-16 text-center text-muted-foreground animate-fade-in">
          <p className="text-sm">
            © 2025 Crick On Time - Premium Sports Streaming Platform
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Highlights;
