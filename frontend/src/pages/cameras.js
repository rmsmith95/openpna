import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import CameraDashboard from 'src/sections/cameras/camera-layout';


const Page = () => (
  <>
    <CameraDashboard />
  </>
);

Page.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Page;
