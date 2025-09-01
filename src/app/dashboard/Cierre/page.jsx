// pages/dashboard/Cierre/page.js
import dynamic from 'next/dynamic';

const TermClosure = dynamic(() => import('../../components/TermClosure'), {
  ssr: false
});

export default function Cierre() {
  return <TermClosure />;
}
