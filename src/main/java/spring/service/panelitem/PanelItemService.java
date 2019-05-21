package spring.service.panelitem;

import java.util.List;

import spring.service.common.BaseObjectService;
import us.mn.state.health.lims.panelitem.valueholder.PanelItem;

public interface PanelItemService extends BaseObjectService<PanelItem> {

	List<PanelItem> getPanelItemsForPanel(String panelId);
}