import {
  Avatar, Box, Flex, Text,
} from '@chakra-ui/react';

export default function SmallCard({
  friendInfo,
}:
{ friendInfo: User }) {
  const len = friendInfo.text?.length;
  let check = false;
  if (len) {
    check = len > 30;
  }
  return (
    <Box
      maxW="inherit"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      _hover={{
        bg: 'blue.100',
        cursor: 'pointer',
      }}
    >
      <Flex alignItems="center" p="4">
        <Avatar size="sm" src={friendInfo.image} name={friendInfo.name} />
        <Box ml="4">
          <Text fontWeight="bold">{friendInfo.name}</Text>
          <Text fontSize="sm" color="gray.600">{check ? `${friendInfo?.text?.slice(0, 30)}.....` : friendInfo.text }</Text>
        </Box>
      </Flex>
    </Box>
  );
}
