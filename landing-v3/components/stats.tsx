import { Card } from '@/components/ui/card';

export function Stats() {
  return (
    <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 relative fade-in-section">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card className="text-center p-4 sm:p-6">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-accent mb-2 sm:mb-3">80/20</div>
            <div className="text-text-secondary text-xs sm:text-sm lg:text-base">Liquid / Earning Split</div>
          </Card>
          <Card className="text-center p-4 sm:p-6">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-accent mb-2 sm:mb-3">4-8%</div>
            <div className="text-text-secondary text-xs sm:text-sm lg:text-base">APY on Base</div>
          </Card>
          <Card className="text-center p-4 sm:p-6">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-accent mb-2 sm:mb-3">0</div>
            <div className="text-text-secondary text-xs sm:text-sm lg:text-base">Lockup Period</div>
          </Card>
          <Card className="text-center p-4 sm:p-6">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-accent mb-2 sm:mb-3">1</div>
            <div className="text-text-secondary text-xs sm:text-sm lg:text-base">SDK Call to Start</div>
          </Card>
        </div>
      </div>
    </section>
  );
}
