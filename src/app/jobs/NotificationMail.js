import Mail from '../../lib/Mail';

class NotificationMail {
  get key() {
    return 'NotificationMail';
  }

  async handle({ data }) {
    const { recipient, deliveryman, pack } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Novo cadastro de encomenda',
      template: 'notification',
      context: {
        deliveryman: deliveryman.name,
        product: pack.product,
        recipient: recipient.name,
        cep: recipient.cep,
        street: recipient.street,
        number: recipient.number,
        city: recipient.city,
        state: recipient.state,
        complement: recipient.complement || 'Sem complemento',
      },
    });
  }
}

export default new NotificationMail();
