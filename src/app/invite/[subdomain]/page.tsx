import { redirect } from 'next/navigation';

export default async function InviteRedirectPage({
  params,
  searchParams,
}: {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await params;
  const subdomain = resolvedParams?.subdomain;
  const resolvedSearch = await searchParams;

  const urlSearchParams = new URLSearchParams();
  if (resolvedSearch) {
    Object.entries(resolvedSearch).forEach(([key, value]) => {
      if (typeof value === 'string') {
        urlSearchParams.set(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((v) => urlSearchParams.append(key, v));
      }
    });
  }

  const queryString = urlSearchParams.toString();
  const target = `/v/${subdomain}${queryString ? `?${queryString}` : ''}`;

  redirect(target);
}
