import BackLink from '../../components/BackLink';
import Confirmed from '../../components/Confirmed';
import PageHeading from '../../components/PageHeading';

export default function ConfirmedPage() {
  return (
    <div className='relative flex flex-col items-center gap-8'>
      <BackLink href='/shop'>Next order</BackLink>

      <PageHeading>Thank you!</PageHeading>

      <div className='h-80 w-80'><Confirmed /></div>
    </div>
  )
}