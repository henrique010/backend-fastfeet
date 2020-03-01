import {
  isAfter,
  isBefore,
  parseISO,
  setSeconds,
  setMinutes,
  setHours,
  startOfDay,
  endOfDay,
} from 'date-fns';
import * as Yup from 'yup';
import { Op } from 'sequelize';
import Package from '../models/Package';

class WithdrawalController {
  async store(req, res) {
    const schema = Yup.object().shape({
      deliveryman_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Invalid fields' });
    }

    const { date, deliveryman_id } = req.body;

    const searcheDate = parseISO(date);
    const startDate = setSeconds(
      setMinutes(setHours(searcheDate, '10'), '59'),
      59
    );
    const endDate = setSeconds(
      setMinutes(setHours(searcheDate, '21'), '00'),
      0
    );

    if (isAfter(searcheDate, startDate) && isBefore(searcheDate, endDate)) {
      const packages = await Package.findAll({
        where: {
          start_date: {
            [Op.between]: [startOfDay(new Date()), endOfDay(new Date())],
          },
        },
      });

      if (packages.length === 5) {
        return res
          .status(401)
          .json({ error: 'Maximum withdrawal limit reached' });
      }

      const pack = await Package.findByPk(req.params.pack_id);

      if (!pack) {
        return res.status(404).json({ error: 'Package not found' });
      }

      if (pack.deliveryman_id !== deliveryman_id) {
        return res.status(401).json({ error: 'This package is not for you' });
      }

      const packWithdrawed = await pack.update({ start_date: date });

      return res.json(packWithdrawed);
    }

    return res.status(401).json({
      error: 'You can only make withdrawals between 08:00h and 18:00h',
    });
  }
}

export default new WithdrawalController();
