import { Spinner } from '@chakra-ui/react';

function Loading() {
  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh',
    }}
    >
      <Spinner size="xl" color="blue.500" />
    </div>
  );
}

export default Loading;
