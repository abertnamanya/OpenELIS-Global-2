package spring.service.datasubmission;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import spring.service.common.BaseObjectServiceImpl;
import us.mn.state.health.lims.datasubmission.dao.DataValueDAO;
import us.mn.state.health.lims.datasubmission.valueholder.DataValue;

@Service
public class DataValueServiceImpl extends BaseObjectServiceImpl<DataValue> implements DataValueService {
  @Autowired
  protected DataValueDAO baseObjectDAO;

  DataValueServiceImpl() {
    super(DataValue.class);
  }

  @Override
  protected DataValueDAO getBaseObjectDAO() {
    return baseObjectDAO;}
}