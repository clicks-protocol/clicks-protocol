import { Card } from '@/components/ui/card';
import { ExternalLink, Bot, Terminal, Sparkles, MessageSquare, BarChart3 } from 'lucide-react';

const integrations = [
  {
    name: 'Claude',
    icon: MessageSquare,
    description: 'Add Clicks to Claude Desktop with one JSON config.',
    href: '/docs#mcp-integration',
  },
  {
    name: 'OpenClaw',
    icon: Bot,
    description: 'One CLI command to connect your OpenClaw agent.',
    href: '/docs#mcp-integration',
  },
  {
    name: 'Codex',
    icon: Terminal,
    description: 'Drop-in MCP config for OpenAI Codex CLI.',
    href: '/docs#mcp-integration',
  },
  {
    name: 'Gemini',
    icon: Sparkles,
    description: 'Connect Gemini CLI to Clicks via MCP.',
    href: '/docs#mcp-integration',
  },
  {
    name: 'Hummingbot',
    icon: BarChart3,
    description: 'Earn yield on idle trading capital between trades.',
    href: 'https://github.com/clicks-protocol/clicks-protocol/blob/main/examples/integrations/hummingbot-integration.md',
    external: true,
  },
];

export function WorksWith() {
  return (
    <section className="py-8 sm:py-12 lg:py-20 px-4 sm:px-6 lg:px-8 relative fade-in-section">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-10 lg:mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">Works With</h2>
          <p className="text-muted-foreground text-base sm:text-lg lg:text-xl">
            Connect any MCP-compatible client in seconds
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {integrations.map((item) => {
            const Icon = item.icon;
            const isExternal = 'external' in item && item.external;

            return (
              <a
                key={item.name}
                href={item.href}
                {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="block"
              >
                <Card className="glassmorphism-strong h-full p-6 sm:p-8 hover-glow cursor-pointer transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                        {item.name}
                        {isExternal && <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />}
                      </h3>
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                    </div>
                  </div>
                </Card>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
