export function Analytics() {
  const cloudflareToken = process.env.NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN;
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <>
      {cloudflareToken ? (
        <script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={JSON.stringify({ token: cloudflareToken })}
        />
      ) : null}
      {plausibleDomain ? (
        <script
          defer
          data-domain={plausibleDomain}
          src="https://plausible.io/js/script.js"
        />
      ) : null}
    </>
  );
}
