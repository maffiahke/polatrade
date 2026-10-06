import { Star } from "lucide-react";

const REVIEWS = [
  {
    name: "David M.",
    role: "Forex Trader",
    quote: "Execution speed is unreal. I've switched from three brokers to just PolaTrades â€” the spreads and fills are noticeably better.",
    rating: 5,
  },
  {
    name: "Sarah K.",
    role: "Crypto Investor",
    quote: "The demo account let me practice without risk. Now I trade confidently with real capital. Support team is super responsive too.",
    rating: 5,
  },
  {
    name: "James O.",
    role: "Day Trader",
    quote: "Clean interface, fast withdrawals, and zero hidden fees. This is exactly what I wanted in a trading platform.",
    rating: 5,
  },
  {
    name: "Linda W.",
    role: "Swing Trader",
    quote: "Finally a platform that works smoothly on mobile. I can manage my positions from anywhere without lag.",
    rating: 4,
  },
  {
    name: "Michael T.",
    role: "Scalper",
    quote: "Sub-second execution and tight spreads â€” essential for my strategy. PolaTrades delivers on both.",
    rating: 5,
  },
  {
    name: "Angela P.",
    role: "Part-time Trader",
    quote: "Started with just $50 and learned the ropes on demo. Now I trade regularly with a solid strategy in place.",
    rating: 5,
  },
];

export function Reviews() {
  return (
    <section id="reviews" className="border-y border-white/[0.07]">
      <div className="max-w-6xl mx-auto px-4 sm:px-5 py-12 sm:py-16 md:py-24">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest mb-3 text-gradient-brand">
            Testimonials
          </p>
          <h2 className="text-3xl md:text-[2.75rem] font-bold text-white">
            Trusted by serious traders
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REVIEWS.map(({ name, role, quote, rating }) => (
            <div
              key={name}
              className="rounded-2xl p-6 border border-white/[0.07] bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-sm transition-all"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "fill-white/[0.08] text-white/20"}`}
                  />
                ))}
              </div>
              <p className="text-sm leading-relaxed mb-4 text-gray-300">"{quote}"</p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-xs font-bold text-white">
                  {name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{name}</div>
                  <div className="text-xs text-gray-500">{role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
