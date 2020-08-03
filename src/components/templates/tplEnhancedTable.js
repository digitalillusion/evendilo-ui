import React from 'react';
import PropTypes from 'prop-types';
import loadable from '@loadable/component';
import { t } from "../../functions";
import { makeStyles } from '@material-ui/styles';
import {
  Checkbox,
  Tooltip,
  Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TableSortLabel,
  IconButton
} from '@material-ui/core';
import {
  FilterList,
  KeyboardArrowRight,
  KeyboardArrowLeft,
  FirstPage,
  LastPage
} from '@material-ui/icons';

const TplEnhancedDialog = loadable(() => import("./tplEnhancedDialog"));

function desc(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const compare = cmp(a[0], b[0]);
    if (compare !== 0) return compare;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

const TablePaginationActions = ({ count, page, rowsPerPage, onChangePage }) => {
  function handleFirstPageButtonClick(event) {
    onChangePage(event, 0);
  }

  function handleBackButtonClick(event) {
    onChangePage(event, page - 1);
  }

  function handleNextButtonClick(event) {
    onChangePage(event, page + 1);
  }

  function handleLastPageButtonClick(event) {
    onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  }

  return (
    <div style={{ flexShrink: 0 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="First Page"
      >
         <FirstPage />
      </IconButton>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="Previous Page">
        <KeyboardArrowLeft />
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="Next Page"
      >
        <KeyboardArrowRight />
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="Last Page"
      >
        <LastPage />
      </IconButton>
    </div>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

const EnhancedTableHead = ({ headers, onSelectAllClick, selectable, sortable, order, orderBy, numSelected, rowCount, onRequestSort }) => {
  const createSortHandler = property => event => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {selectable && <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={numSelected === rowCount}
            onChange={onSelectAllClick}
          />
        </TableCell>}
        {headers.map(
          header => (
            <TableCell
              key={header.id}
              sortDirection={orderBy === header.id ? order : false}
              padding="none"
              {...(header.width ? { width: header.width } : {})}
            >
              {sortable ? <Tooltip
                title="Sort"
                enterDelay={300}
              >
                <TableSortLabel
                  active={orderBy === header.id}
                  direction={order}
                  onClick={createSortHandler(header.id)}
                >
                  {header.label}
                </TableSortLabel>
              </Tooltip> : header.label}
            </TableCell>
          ),
          this,
        )}
      </TableRow>
    </TableHead>
  );
};

EnhancedTableHead.propTypes = {
  headers: PropTypes.array.isRequired,
  selectable: PropTypes.bool.isRequired,
  sortable: PropTypes.bool.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired
};

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing ? theme.spacing(3) : "1em",
  },
  table: {
    minWidth: 1020,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
}));

const TplEnhancedTable = ({
   headers = [], rows = [], rowMapper = item => [item, {}], filterDefault = {}, paginationDefault = { number: 0, size: 10, totalElements: 0 }, selectionDefault = [], onPageChange = () => {}, onFilterChange = () => {}, onSelectionChange = () => {},
   filterable = false, selectable = false, sortable = false, pageable = false, controlled = filterable, clearSelection = false}) => {

  function buildDefaultSelection(selectionDefault) {
    let defaultSelected = {}
    if (selectionDefault) {
      selectionDefault.forEach(sd => defaultSelected[serialize(sd)] = sd)
    }
    return defaultSelected
  }

  const classes = useStyles();
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [selected, setSelected] = React.useState(buildDefaultSelection(selectionDefault));

  let page, setPage, rowsPerPage, setRowsPerPage, rowsCount;
  if(Object.entries(selected).length > 0 && clearSelection) {
    setSelected({});
  }

  [page, setPage] = React.useState(paginationDefault.number || 0);
  [rowsPerPage, setRowsPerPage] = React.useState(paginationDefault.size || 10);
  if (!controlled) {
    rowsCount = rows.length;
  } else {
    page = paginationDefault.number;
    rowsPerPage = paginationDefault.size;
    rowsCount = paginationDefault.totalElements;
  }

  function serialize(obj) {
    let str = [];
    for (let p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.sort().join(";");
  }

  function handleRequestSort(event, property) {
    const isDesc = orderBy === property && order === 'desc';
    setOrder(isDesc ? 'asc' : 'desc');
    setOrderBy(property);
  }

  function handleSelectAllClick(event) {
    let newSelecteds = Object.assign({}, selected);
    if (event.target.checked) {
      let isDeselection = false
      let newSelectedKeys = Object.keys(newSelecteds)
      for (let i = 0; i < rows.length && !isDeselection; i++) {
        isDeselection = newSelectedKeys.includes(serialize(rows[i]))
      }
      rows.forEach(n => {
        if (isDeselection) {
          delete newSelecteds[serialize(n)]
        } else {
          newSelecteds[serialize(n)] = n
        }
      })
      updateSelection(newSelecteds);
    } else {
      setSelected({})
      onSelectionChange([])
    }
  }

  function updateSelection(selectedEntries) {
    let modifiedSelection = onSelectionChange(Object.values(selectedEntries), Object.values(selected));
    if (modifiedSelection) {
      let modifiedSelected = {}
      Object.entries(selectedEntries).filter(([seKey, seValue]) => modifiedSelection.includes(seValue)).reduce((acc, val) => {
        acc[val[0]] = val[1]
        return acc
      }, modifiedSelected)
      setSelected(modifiedSelected)
    } else {
      setSelected(selectedEntries)
    }

  }

  function handleClick(event, id, n) {
    const selectedIndex = Object.keys(selected).indexOf(id);
    let selectedEntries = Object.assign({}, selected);

    if (selectedIndex === -1) {
      Object.assign(selectedEntries, {[id]: n});
    } else {
      delete selectedEntries[id];
    }

    updateSelection(selectedEntries);
  }

  function handleChangePage(event, newPage) {
    if(page === newPage) {
      return;
    }
    onPageChange({
      size: rowsPerPage,
      number: newPage,
      totalElements: rowsCount
    });
    if (!controlled) {
      setPage(newPage);
    }
  }

  function handleChangeRowsPerPage(event, selector) {
    onPageChange({
      size: selector.props.value,
      number: 0,
      totalElements: rowsCount
    });
    if (!controlled) {
      setRowsPerPage(selector.props.value);
    }
  }

  const isSelected = id => Object.keys(selected).indexOf(id) !== -1;

  const emptyRows = controlled ? rows.length - rowsPerPage : rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  const visibleHeaders = headers.filter(h => h.hidden !== true);

  const sorting = order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);

  let pagedSortedRows = stableSort(rows, sorting)
    .slice(pageable && !controlled ? page * rowsPerPage : 0, pageable && !controlled ? page * rowsPerPage + rowsPerPage : rows.length);
  return (
    <div className={classes.root}>
      {filterable && <TplEnhancedDialog
        key={serialize(filterDefault)}
        title={t("tpl.enhancedTable.filterResults")}
        headers={headers.filter(h => h.filterable)}
        confirmProps={{ label : t("tpl.enhancedTable.filter"), icon: <FilterList />, name: "confirm_filter" }}
        cancelProps = {{label : t("tpl.enhancedTable.cancel"), name: "cancel"}}
        initialValues={filterDefault}
        showProps={{ label : t("tpl.enhancedTable.filter"), icon: <FilterList />, name: "filter" }}
        onConfirm={filter => onFilterChange(filter)}
      />}
      <div className={classes.tableWrapper}>
        <Table className={classes.table} aria-labelledby="tableTitle">
          <EnhancedTableHead
            selectable={selectable}
            sortable={sortable}
            headers={visibleHeaders}
            numSelected={Object.entries(selected).length}
            order={order}
            orderBy={orderBy}
            onSelectAllClick={handleSelectAllClick}
            onRequestSort={handleRequestSort}
            rowCount={rowsCount}
          />
          <TableBody>
            {pagedSortedRows
              .map((n, index) => {
                const nid = serialize(n);
                const isItemSelected = isSelected(nid);
                let [mappedItem, mappedRowProps] = rowMapper(Object.assign({}, n));
                return (
                  <TableRow
                    {...(selectable ? { hover : true, onClick : event => handleClick(event, nid, n) } : {})}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={nid}
                    selected={isItemSelected}
                    {...mappedRowProps}>
                    {selectable && <TableCell padding="checkbox" key={nid + '-selectable-' + index}>
                      <Checkbox id={index} checked={isItemSelected} />
                    </TableCell>}
                    {visibleHeaders.map(header => {
                      let cellValue = mappedItem[header.id];
                      if (header.type === 'enum') {
                        let matchingValues = header.values.filter(v => v.key === mappedItem[header.id]);
                        if(matchingValues.length > 0) {
                          cellValue = matchingValues[0].value;
                        }
                      }
                      return <TableCell {...header.cellProps}  padding="none" key={nid + '-' + header.id + '-' + index}>{cellValue}</TableCell>;
                    })}
                  </TableRow>
                );
              })}
            {emptyRows > 0 && (
              <TableRow style={{ height: 49 * emptyRows }}>
                <TableCell colSpan={visibleHeaders.length} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pageable && <TablePagination
        labelRowsPerPage={t("tpl.list.rows.per.page")}
        labelDisplayedRows={paginationDefault.labelDisplayedRows || (({ from, to, count }) => `${from}-${to} / ${count}`) }
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={rowsCount || 0}
        rowsPerPage={rowsPerPage || 10}
        page={page || 0}
        backIconButtonProps={{
          'aria-label': 'Previous Page',
        }}
        nextIconButtonProps={{
          'aria-label': 'Next Page',
        }}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
        ActionsComponent={TablePaginationActions}
      />}
    </div>
  );
};

TplEnhancedTable.propTypes = {
  headers: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
  rowMapper: PropTypes.func,
  filterDefault: PropTypes.object,
  paginationDefault: PropTypes.object,
  onPageChange: PropTypes.func,
  filterComponent: PropTypes.object,
  selectable: PropTypes.bool,
  sortable: PropTypes.bool,
  pageable: PropTypes.bool,
  controlled: PropTypes.bool,
  onFilterChange: PropTypes.func,
  onSelectionChange: PropTypes.func,
  filterable: PropTypes.bool,
  clearSelection: PropTypes.bool
};

export default TplEnhancedTable;
