import Home from '@/components/ui/Home';
import { profile, stops } from '@/content/portfolio';

export default function Page() {
  return <Home profile={profile} stops={stops} />;
}
