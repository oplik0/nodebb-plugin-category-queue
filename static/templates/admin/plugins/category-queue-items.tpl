<ul data-cid="{cid}">
<!-- BEGIN categories -->
  <li data-cid="{categories.cid}" data-parent-cid="{categories.parentCid}" data-name="{categories.name}" <!-- IF categories.disabled -->class="disabled"<!-- ENDIF categories.disabled -->>
    <div class="form-group row category-row">
      <label for="{categories.cid}" class="col-xs-6 control-label">{categories.name}</label>
      <div class="col-xs-6">
        <select data-cid="{categories.cid}" id="{categories.cid}" name="{categories.cid}" title="{categories.name}" class="form-control" <!-- IF categories.disabled -->class="disabled"<!-- ENDIF categories.disabled -->>
          <option value="">Don't queue</option>
          <option value="{categories.cid}">Queue</option>
        </select>
      </div>
    </div>
  </li>
<!-- END categories -->
</ul>