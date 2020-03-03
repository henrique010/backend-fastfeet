import Sequelize from 'sequelize';
import databaseConfig from '../../config/database';

const sequelize = new Sequelize(databaseConfig);

class ProblemPackageController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const problemsPackages = await sequelize.query(
      'SELECT * FROM packages p ' +
        'WHERE EXISTS (SELECT * FROM delivery_problems dp ' +
        'WHERE dp.delivery_id = p.id) ' +
        `LIMIT 20 OFFSET ${(page - 1) * 20}`,
      { type: sequelize.QueryTypes.SELECT }
    );

    if (problemsPackages.length === 0) {
      return res
        .status(404)
        .json({ error: 'Packages with problems not found' });
    }

    return res.json(problemsPackages);
  }
}

export default new ProblemPackageController();
