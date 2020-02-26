import * as Yup from 'yup';
import axios from 'axios';
import Recipient from '../models/Recipient';
import cepConfig from '../../config/cep';

class RecipientController {
  async store(req, res) {
    const schema = Yup.object().shape({
      cep: Yup.string()
        .required()
        .length(9),
      name: Yup.string().required(),
      number: Yup.number().required(),
      complement: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Invalid fields' });
    }

    try {
      const { cep, name, number, complement } = req.body;
      const formatted_cep = cep.replace('-', '');

      const response = await axios.get(
        `${cepConfig.url}/${formatted_cep}/${cepConfig.returnType}`
      );

      const { logradouro: street, localidade: city, uf: state } = response.data;

      const recipientsExists = await Recipient.findOne({
        where: { street, number },
      });

      if (recipientsExists) {
        return res.status(400).json({ error: 'Recipient already exists' });
      }

      const recipient = await Recipient.create({
        name,
        number,
        street,
        city,
        state,
        complement: complement || '',
        cep: formatted_cep,
      });

      return res.json(recipient);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid cep' });
    }
  }

  async update(req, res) {
    return res.json({ ok: req.userId });
  }
}

export default new RecipientController();
