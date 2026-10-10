import { Icon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { getPool } from "@/lib/db";

const galleryGroups = [
  ["Office & consultations", "A look at the people and space behind the work."],
  ["Society & site visits", "Moments from on-ground coordination and support."],
  ["Milestones", "Professional updates, events, and completed milestones."],
];

export const revalidate = 60; // Revalidate every 60 seconds

export default async function GalleryPage() {
  let galleryItems: any[] = [];
  try {
    const pool = getPool();
    const result = await pool.query(
      "SELECT * FROM gallery WHERE is_active = true ORDER BY display_order ASC, created_at DESC"
    );
    galleryItems = result.rows;
  } catch (error) {
    console.error("Error fetching gallery:", error);
  }

  const getItemsForCategory = (title: string) =>
    galleryItems.filter((item) => item.category === title);

  return (
    <>
      <PageHero
        compact={true}
        eyebrow="Gallery"
        title="The work behind every next step."
        copy="We are preparing a visual record of S.P Consultant's consultations, field work, and milestones. Client confidentiality always comes first."
      />
      
      <section className="px-5 py-10 sm:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          {galleryItems.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-[#0d3369]/20 bg-[#f8fbff] px-7 py-12 text-center sm:px-12">
              <Icon name="sparkle" className="mx-auto h-7 w-7 text-[#126ce5]" />
              <h2 className="mt-4 text-2xl font-extrabold text-[#09295a]">
                Gallery content is being curated.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#62728a]">
                We will publish authentic photos supplied and approved by S.P
                Consultant—never client documents, private records, or images
                without permission.
              </p>
            </div>
          ) : (
            <div className="space-y-24">
              {galleryGroups.map(([title, copy]) => {
                const items = getItemsForCategory(title);
                if (items.length === 0) return null;
                return (
                  <div key={title} className="space-y-8">
                    <div>
                      <h3 className="text-3xl font-black text-[#09295a] tracking-tight">{title}</h3>
                      <p className="text-[#62728a] mt-2">{copy}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {items.map((item) => (
                        <div key={item.id} className="group relative aspect-square bg-gray-100 rounded-2xl overflow-hidden cursor-zoom-in">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={item.image_url} 
                            alt={item.title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                          />
                          {item.description && (
                            <div className="absolute inset-0 bg-gradient-to-t from-[#09295a]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-end p-5">
                              <span className="text-white font-semibold text-sm drop-shadow-md">
                                {item.description}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
