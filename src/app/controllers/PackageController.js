import * as Yup from 'yup';
import Package from '../models/Package';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';
import Mail from '../../lib/Mail';

class PackageController {
  async index(req, res) {
    const packages = await Package.findAll({
      attributes: [
        'id',
        'product',
        'canceled_at',
        'start_date',
        'end_date',
        'createdAt',
      ],
      order: ['createdAt'],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'name',
            'number',
            'street',
            'city',
            'state',
            'cep',
          ],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['path', 'url'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(packages);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Invalid fields' });
    }

    const pack = await Package.create(req.body);

    const { recipient_id, deliveryman_id } = req.body;

    const recipient = await Recipient.findByPk(recipient_id);
    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

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

    return res.json(pack);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string(),
      signature_id: Yup.number(),
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
      start_date: Yup.date(),
      end_date: Yup.date(),
      canceled_at: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      res.status(400).json({ error: 'Invalid fields' });
    }

    const pack = await Package.findByPk(req.params.id);

    const { recipient_id, deliveryman_id, signature_id } = req.body;

    if (recipient_id && recipient_id !== pack.recipient_id) {
      const recipientExists = await Recipient.findByPk(recipient_id);

      if (!recipientExists) {
        res.status(404).json({ error: 'Recipient not found' });
      }
    }

    if (deliveryman_id && deliveryman_id !== pack.deliveryman_id) {
      const deliverymanExists = await Deliveryman.findByPk(deliveryman_id);

      if (!deliverymanExists) {
        res.status(404).json({ error: 'Deliveryman not found' });
      }
    }

    if (signature_id && signature_id !== pack.signature_id) {
      const signatureExists = await File.findByPk(signature_id);

      if (!signatureExists) {
        res.status(404).json({ error: 'Signature not found' });
      }
    }

    const packUpdated = await pack.update(req.body);

    return res.json(packUpdated);
  }

  async delete(req, res) {
    const pack = await Package.findByPk(req.params.id);

    if (!pack) {
      return res.status(404).json({ error: 'Package not found' });
    }

    await pack.destroy();

    return res.json();
  }
}

export default new PackageController();
