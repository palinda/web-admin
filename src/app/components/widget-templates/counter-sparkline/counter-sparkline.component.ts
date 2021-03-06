import { Size } from '@defs/size';
import { SparkLinkOptions } from '@components/unit/u-sparkline/u-sparkline.component';
import { SparkResp } from '@defs/spark-resp';
import { LogService } from '@services/log.service';
import { RefreshRequest } from '@defs/refresh-request';
import { DynamicMsg } from '@defs/dynamic-msg';
import { Query } from '@defs/query';
import { RefreshService } from '@services/refresh.service';
import { PermissionType } from '@defs/permission-type';
import { WidgetTemplateComponent } from '@components/widget-template.component';
import { Component, OnInit, Input } from '@angular/core';
import { CountResp } from '@defs/count-resp';
import { TrackType } from '@app/defs/track-type';
import { ResizeService } from '@services/resize.service';

@Component({
  selector: 'app-counter-sparkline',
  template: `
    <div>
      <app-u-text i18n [text]="heading" [styles]="headingStyles"></app-u-text>
      <div class="h-seperator"></div>
      <div fxLayout="row" fxLayoutAlign="space-around stretch">
        <div fxFlex="30" class="graph">
          <app-bg-counter [value]="count" [size]="countSize"></app-bg-counter>
        </div>
        <div fxFlex class="graph">
          <app-u-sparkline [data]="sparkData" [options]="sparkOptions"></app-u-sparkline>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tile {
      width: 200px;
    }

    .graph {
      padding: 10px;
    }

  `]
})
export class CounterSparklineComponent extends WidgetTemplateComponent implements OnInit {

  static key = 'CounterSparklineComponent';

  /**
 * @description {String} Widget heading
 */
  @TrackType(String)
  @Input() heading = '';

  /**
 * @description {Number} Data refresh interval
 */
  @TrackType(Number)
  @Input() refreshInterval = 10;

  /**
 * Count data query
 * Response should be in format { "count" : number }
 */
  @TrackType(Query)
  @Input() countQuery: Query<DynamicMsg>;

  /**
 * Spark data query
 * Response should be in format [{ "key" : name, "value" : value }, { "key" : name, "value" : value }, ...] {@link SparkResp|SparkResp}
 */
  @TrackType(Query)
  @Input() sparkQuery: Query<DynamicMsg>;

  /**
   * Sparkline options, shared with view
   */
  sparkOptions: SparkLinkOptions;
  count: number;
  sparkData = [];
  countSize = 50;

  /**
   * Heading styles
   */
  headingStyles = {
    'font-size.px': '20',
    'color' : 'gray'
  };

  constructor(logService: LogService, resizeService: ResizeService, refreshService: RefreshService) {
    super(logService, resizeService, refreshService);
    this.sparkOptions = new SparkLinkOptions('key', 'value', 'spline', '#9ab57e', '#e55253', '4', undefined, '#ebdd8f',
    'currency', new Size('100', '200'));
  }

  ngOnInit() {
    this.sparkOptions.size = this.componentDef.size.toPixel(60, 45);
    this.countSize = this.calcFontSize(this.componentDef.size, 30);
    this.subscribeForRefresh([
        new RefreshRequest<CountResp>(this.refreshInterval, this.countQuery, (data, err) => {
          if (err !== undefined) {
            this.onError(err, this.countQuery);
          } else {
            this.count = data.count;
          }
        }),
        new RefreshRequest<SparkResp>(this.refreshInterval, this.sparkQuery, (data, err) => {
          if (err !== undefined) {
            this.onError(err, this.sparkQuery);
          } else {
            this.sparkData = data.data;
          }
        })
    ]);
    this.subscribeForResize((size: Size) => {
      this.sparkOptions.size = size.toPixel(60, 45);
      this.countSize = this.calcFontSize(size, 30);
    });
  }

}
