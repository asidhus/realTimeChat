// The below import defines which components come from formik
// import { Field, Form, Formik } from 'formik';

import {
  Button,
  Input,
  Flex,
} from '@chakra-ui/react';

import axios from 'axios';

import {
  Formik, Field, Form, FieldInputProps, FormikValues, FormikHelpers as FormikActions,
} from 'formik';

interface MyFormValues {
  text: string;
}
type Message = {
  id: number;
  text: string;
  senderId: string;
  timestamp: number;
};

async function addFriendDB(
  values: FormikValues,
  actions: FormikActions<MyFormValues>,
  friend: User | null,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setFriends: React.Dispatch<React.SetStateAction<User[]>>,
) {
  try {
    const message = await axios.post('/api/messages/addMessage', { friend, text: values.text });
    console.log(message);

    setMessages((prev: Message[]) => [...prev, message.data]);
    actions.resetForm({
      values: {
        text: '',
      },
    });
    setFriends((prev: User[]) => {
      const index = prev.findIndex((x) => x.id === friend?.id);
      if (index !== -1) {
        const move = prev.splice(index, 1)[0];
        move.timestamp = Date.now();
        move.text = values.text;
        const temp = [move, ...prev];
        return temp;
      }
      return prev;
    });
  } catch (err) {
    console.log('ERROR WHILE SENDING MESSAGE');
  } finally {
    actions.setSubmitting(false);
  }
}

function addMessage(
  friend: User | null,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setFriends: React.Dispatch<React.SetStateAction<User[]>>,
) {
  const initialValues = { text: '' };

  return (
    <div>
      <Formik
        initialValues={initialValues}
        onSubmit={async (values: FormikValues, actions: FormikActions<MyFormValues>) => {
          await addFriendDB(values, actions, friend, setMessages, setFriends);
        }}
      >
        {(props) => (
          <Form>
            <Flex mt={2}>
              <Field name="text">
                {({ field }:{ field: FieldInputProps<string> }) => (
                  <>
                    <Input
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      value={field.value}
                      id="text"
                      placeholder="Send Message"
                    />

                    <Button
                      colorScheme="teal"
                      isLoading={props.isSubmitting}
                      type="submit"
                      pl={2}
                    >
                      Submit
                    </Button>
                  </>
                )}
              </Field>
            </Flex>
          </Form>

        )}
      </Formik>
    </div>
  );
}

export default addMessage;
