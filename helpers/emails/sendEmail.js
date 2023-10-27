import axios from "axios";

export default async function sendEmail({
  email,
  subject,
  templateName,
  variables,
  authToken,
}) {
  let res = await axios.post(
    `${process.env.CAMPAIGNS_SERVICE_URL}/sendTransactionalEmail`,
    {
      email: email,
      subject: subject,
      templateName: templateName,
      variables: variables,
    },
    {
      headers: {
        "eazyrooms-token": authToken,
      },
    }
  );

  return res.data;
}
